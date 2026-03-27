import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly DEFAULT_TTL = 300; // seconds
  private readonly SHORT_TTL = 60; // seconds — active sprint burndown

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ─── Task Distribution ───────────────────────────────────────────────

  async getTaskDistribution(projectId: string, sprintId?: string) {
    const cacheKey = `analytics:${projectId}:distribution:${sprintId || 'all'}`;
    const cached = await this.getCached<{ status: string; count: number }[]>(cacheKey);
    if (cached) return cached;

    const groups = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId, deletedAt: null, ...(sprintId && { sprintId }) },
      _count: { id: true },
    });

    const result = groups.map((g) => ({
      status: g.status,
      count: g._count.id,
    }));

    await this.setCache(cacheKey, result, this.DEFAULT_TTL);
    return result;
  }

  // ─── Priority Breakdown ──────────────────────────────────────────────

  async getPriorityBreakdown(projectId: string, sprintId?: string) {
    const cacheKey = `analytics:${projectId}:priority:${sprintId || 'all'}`;
    const cached = await this.getCached<{ priority: string; count: number }[]>(cacheKey);
    if (cached) return cached;

    const groups = await this.prisma.task.groupBy({
      by: ['priority'],
      where: { projectId, deletedAt: null, ...(sprintId && { sprintId }) },
      _count: { id: true },
    });

    const result = groups.map((g) => ({
      priority: g.priority,
      count: g._count.id,
    }));

    await this.setCache(cacheKey, result, this.DEFAULT_TTL);
    return result;
  }

  // ─── Member Workload ─────────────────────────────────────────────────

  async getMemberWorkload(projectId: string, sprintId?: string) {
    const cacheKey = `analytics:${projectId}:workload:${sprintId || 'all'}`;
    const cached = await this.getCached<
      {
        userId: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        taskCount: number;
        completedCount: number;
      }[]
    >(cacheKey);
    if (cached) return cached;

    const sprintFilter = sprintId ? { sprintId } : {};

    // Group tasks by assigneeId to get total count
    const taskGroups = await this.prisma.task.groupBy({
      by: ['assigneeId'],
      where: { projectId, deletedAt: null, assigneeId: { not: null }, ...sprintFilter },
      _count: { id: true },
    });

    // Group completed tasks by assigneeId
    const completedGroups = await this.prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        projectId,
        deletedAt: null,
        assigneeId: { not: null },
        status: 'DONE',
        ...sprintFilter,
      },
      _count: { id: true },
    });

    const completedMap = new Map(
      completedGroups.map((g) => [g.assigneeId, g._count.id]),
    );

    // Fetch user data for all assignees
    const assigneeIds = taskGroups
      .map((g) => g.assigneeId)
      .filter((id): id is string => id !== null);

    const users = await this.prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = taskGroups
      .filter((g) => g.assigneeId !== null)
      .map((g) => {
        const user = userMap.get(g.assigneeId!);
        return {
          userId: g.assigneeId!,
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
          avatarUrl: user?.avatarUrl ?? null,
          taskCount: g._count.id,
          completedCount: completedMap.get(g.assigneeId) ?? 0,
        };
      });

    await this.setCache(cacheKey, result, this.DEFAULT_TTL);
    return result;
  }

  // ─── Velocity (last 8 weeks) ─────────────────────────────────────────

  async getVelocity(projectId: string, sprintId?: string) {
    const cacheKey = `analytics:${projectId}:velocity:${sprintId || 'all'}`;
    const cached = await this.getCached<
      { week: string; completedCount: number }[]
    >(cacheKey);
    if (cached) return cached;

    if (sprintId) {
      // When filtering by sprint, get tasks completed in that sprint
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: sprintId },
      });
      if (!sprint || !sprint.startDate) return [];

      const endDate = sprint.completedAt || new Date();

      const rows = await this.prisma.$queryRaw<
        { week: Date; completed_count: bigint }[]
      >`
        SELECT
          date_trunc('week', "completedAt")::date AS week,
          COUNT(*)::bigint AS completed_count
        FROM tasks
        WHERE "projectId" = ${projectId}
          AND "sprintId" = ${sprintId}
          AND "completedAt" IS NOT NULL
          AND "completedAt" >= ${sprint.startDate}
          AND "completedAt" <= ${endDate}
          AND "deletedAt" IS NULL
        GROUP BY date_trunc('week', "completedAt")
        ORDER BY week ASC
      `;

      const result = rows.map((r) => ({
        week: new Date(r.week).toISOString().split('T')[0],
        completedCount: Number(r.completed_count),
      }));

      await this.setCache(cacheKey, result, this.DEFAULT_TTL);
      return result;
    }

    // Default: last 8 weeks across all tasks
    const now = new Date();
    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7);
    // Align to Monday
    const day = eightWeeksAgo.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday = 1
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - diff);
    eightWeeksAgo.setHours(0, 0, 0, 0);

    const rows = await this.prisma.$queryRaw<
      { week: Date; completed_count: bigint }[]
    >`
      SELECT
        date_trunc('week', "completedAt")::date AS week,
        COUNT(*)::bigint AS completed_count
      FROM tasks
      WHERE "projectId" = ${projectId}
        AND "completedAt" IS NOT NULL
        AND "completedAt" >= ${eightWeeksAgo}
        AND "deletedAt" IS NULL
      GROUP BY date_trunc('week', "completedAt")
      ORDER BY week ASC
    `;

    const result = rows.map((r) => ({
      week: new Date(r.week).toISOString().split('T')[0],
      completedCount: Number(r.completed_count),
    }));

    await this.setCache(cacheKey, result, this.DEFAULT_TTL);
    return result;
  }

  // ─── Overdue Tasks ───────────────────────────────────────────────────

  async getOverdueTasks(projectId: string, sprintId?: string) {
    const now = new Date();

    const overdueWhere = {
      projectId,
      deletedAt: null,
      dueDate: { lt: now },
      status: { not: 'DONE' as const },
      ...(sprintId && { sprintId }),
    };

    const [count, tasks] = await Promise.all([
      this.prisma.task.count({ where: overdueWhere }),
      this.prisma.task.findMany({
        where: overdueWhere,
        orderBy: { dueDate: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          dueDate: true,
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return { overdueCount: count, tasks };
  }

  // ─── Sprint Burndown ─────────────────────────────────────────────────

  async getBurndown(projectId: string, sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint || !sprint.startDate || !sprint.endDate) {
      return [];
    }

    const isActive = sprint.status === 'ACTIVE';
    const cacheKey = `analytics:${projectId}:burndown:${sprintId}`;
    const ttl = isActive ? this.SHORT_TTL : this.DEFAULT_TTL;
    const cached = await this.getCached<
      { day: string; ideal: number; actual: number }[]
    >(cacheKey);
    if (cached) return cached;

    // Get all tasks that were (or still are) in this sprint
    // We need tasks currently in the sprint + tasks that were completed in the sprint
    const sprintTasks = await this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
        OR: [
          { sprintId },
          // Tasks completed during this sprint (may have been moved out after completion)
          {
            completedAt: {
              gte: sprint.startDate,
              ...(sprint.completedAt ? { lte: sprint.completedAt } : {}),
            },
          },
        ],
      },
      select: {
        id: true,
        sprintId: true,
        status: true,
        completedAt: true,
      },
    });

    // Only count tasks that belong to this sprint
    const tasksInSprint = sprintTasks.filter((t) => t.sprintId === sprintId);
    // Also include tasks completed in sprint but possibly moved out
    const completedInSprintWindow = sprintTasks.filter(
      (t) =>
        t.sprintId !== sprintId &&
        t.completedAt &&
        t.completedAt >= sprint.startDate! &&
        (!sprint.completedAt || t.completedAt <= sprint.completedAt),
    );

    // Total tasks = current sprint tasks + any that were completed during the sprint window
    // For a simpler approach: count tasks currently in sprint as the base
    const totalTasks =
      sprint.scopeAtStart ?? tasksInSprint.length;

    // Build day-by-day data
    const startDate = new Date(sprint.startDate);
    const endBound = sprint.completedAt
      ? new Date(sprint.completedAt)
      : new Date(sprint.endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // For active sprints, only show data up to today
    const displayEnd = isActive && today < endBound ? today : endBound;

    // Calculate total duration in days for ideal line
    const totalDurationMs = endBound.getTime() - startDate.getTime();
    const totalDurationDays = Math.max(
      1,
      Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)),
    );

    // Build list of completion timestamps
    const completions: Date[] = [];
    for (const task of tasksInSprint) {
      if (task.status === 'DONE' && task.completedAt) {
        completions.push(new Date(task.completedAt));
      }
    }

    const result: { day: string; ideal: number; actual: number }[] = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    let dayIndex = 0;
    while (cursor <= displayEnd) {
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);

      // Ideal: straight line from totalTasks to 0
      const ideal = Math.max(
        0,
        Math.round(
          totalTasks - (totalTasks / totalDurationDays) * dayIndex,
        ),
      );

      // Actual: total tasks minus tasks completed on or before this day
      const completedByDay = completions.filter(
        (c) => c <= dayEnd,
      ).length;
      const actual = totalTasks - completedByDay;

      result.push({
        day: cursor.toISOString().split('T')[0],
        ideal,
        actual,
      });

      cursor.setDate(cursor.getDate() + 1);
      dayIndex++;
    }

    // For active sprints: project ideal line forward to end date if we stopped before
    if (isActive && today < endBound) {
      const idealCursor = new Date(cursor);
      while (idealCursor <= endBound) {
        const idealVal = Math.max(
          0,
          Math.round(
            totalTasks - (totalTasks / totalDurationDays) * dayIndex,
          ),
        );
        result.push({
          day: idealCursor.toISOString().split('T')[0],
          ideal: idealVal,
          actual: -1, // -1 signals "no actual data" (future)
        });
        idealCursor.setDate(idealCursor.getDate() + 1);
        dayIndex++;
      }
    }

    await this.setCache(cacheKey, result, ttl);
    return result;
  }

  // ─── Sprint Velocity (cross-sprint) ──────────────────────────────────

  async getSprintVelocity(projectId: string) {
    const cacheKey = `analytics:${projectId}:sprint-velocity`;
    const cached = await this.getCached<
      {
        sprintName: string;
        sprintNumber: number;
        completedPoints: number;
        completedTasks: number;
        avgVelocity: number | null;
      }[]
    >(cacheKey);
    if (cached) return cached;

    const closedSprints = await this.prisma.sprint.findMany({
      where: {
        projectId,
        status: 'CLOSED',
      },
      orderBy: { completedAt: 'asc' },
      select: {
        id: true,
        name: true,
        completedAt: true,
      },
    });

    if (closedSprints.length === 0) return [];

    // For each closed sprint, count completed tasks and sum story points
    const result: {
      sprintName: string;
      sprintNumber: number;
      completedPoints: number;
      completedTasks: number;
      avgVelocity: number | null;
    }[] = [];

    for (let i = 0; i < closedSprints.length; i++) {
      const sprint = closedSprints[i];

      const [taskCount, pointsResult] = await Promise.all([
        this.prisma.task.count({
          where: {
            projectId,
            sprintId: sprint.id,
            status: 'DONE',
            deletedAt: null,
          },
        }),
        this.prisma.task.aggregate({
          where: {
            projectId,
            sprintId: sprint.id,
            status: 'DONE',
            deletedAt: null,
          },
          _sum: { storyPoints: true },
        }),
      ]);

      const completedPoints = pointsResult._sum.storyPoints ?? 0;

      // Rolling 3-sprint average
      let avgVelocity: number | null = null;
      if (i >= 2) {
        const last3 = result.slice(i - 2, i).concat([
          { completedPoints } as any,
        ]);
        avgVelocity = Math.round(
          last3.reduce((sum, s) => sum + s.completedPoints, 0) / 3,
        );
      } else if (i >= 1) {
        // At least 2 sprints for a partial average
        const available = result.slice(0, i).concat([
          { completedPoints } as any,
        ]);
        avgVelocity = Math.round(
          available.reduce((sum, s) => sum + s.completedPoints, 0) /
            available.length,
        );
      }

      result.push({
        sprintName: sprint.name,
        sprintNumber: i + 1,
        completedPoints,
        completedTasks: taskCount,
        avgVelocity,
      });
    }

    await this.setCache(cacheKey, result, this.DEFAULT_TTL);
    return result;
  }

  // ─── Cache Invalidation ──────────────────────────────────────────────

  async invalidateCache(projectId: string) {
    const pattern = `analytics:${projectId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // ─── Private Cache Helpers ───────────────────────────────────────────

  private async getCached<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  private async setCache(key: string, data: any, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(data), 'EX', ttl);
  }
}
