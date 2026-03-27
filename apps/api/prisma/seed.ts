import { PrismaClient, WorkspaceRole, TaskStatus, TaskPriority, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'jerome@flowboard.dev',
        password: passwordHash,
        firstName: 'Jerome',
        lastName: 'Admin',
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah@flowboard.dev',
        password: passwordHash,
        firstName: 'Sarah',
        lastName: 'Developer',
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@flowboard.dev',
        password: passwordHash,
        firstName: 'Mike',
        lastName: 'Designer',
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna@flowboard.dev',
        password: passwordHash,
        firstName: 'Anna',
        lastName: 'Manager',
        avatarUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: 'viewer@flowboard.dev',
        password: passwordHash,
        firstName: 'Guest',
        lastName: 'Viewer',
        avatarUrl: null,
      },
    }),
  ]);

  const [jerome, sarah, mike, anna, viewer] = users;

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'FlowBoard Team',
      slug: 'flowboard-team',
      description: 'Main workspace for the FlowBoard development team',
    },
  });

  // Create memberships
  await Promise.all([
    prisma.workspaceMembership.create({
      data: { userId: jerome.id, workspaceId: workspace.id, role: WorkspaceRole.OWNER, joinedAt: new Date() },
    }),
    prisma.workspaceMembership.create({
      data: { userId: sarah.id, workspaceId: workspace.id, role: WorkspaceRole.ADMIN, invitedById: jerome.id, joinedAt: new Date() },
    }),
    prisma.workspaceMembership.create({
      data: { userId: mike.id, workspaceId: workspace.id, role: WorkspaceRole.MEMBER, invitedById: jerome.id, joinedAt: new Date() },
    }),
    prisma.workspaceMembership.create({
      data: { userId: anna.id, workspaceId: workspace.id, role: WorkspaceRole.MEMBER, invitedById: sarah.id, joinedAt: new Date() },
    }),
    prisma.workspaceMembership.create({
      data: { userId: viewer.id, workspaceId: workspace.id, role: WorkspaceRole.VIEWER, invitedById: jerome.id, joinedAt: new Date() },
    }),
  ]);

  // Create labels
  const labels = await Promise.all([
    prisma.label.create({ data: { workspaceId: workspace.id, name: 'Bug', color: '#ef4444' } }),
    prisma.label.create({ data: { workspaceId: workspace.id, name: 'Feature', color: '#3b82f6' } }),
    prisma.label.create({ data: { workspaceId: workspace.id, name: 'Enhancement', color: '#8b5cf6' } }),
    prisma.label.create({ data: { workspaceId: workspace.id, name: 'Documentation', color: '#06b6d4' } }),
    prisma.label.create({ data: { workspaceId: workspace.id, name: 'Urgent', color: '#f97316' } }),
  ]);

  // Create project
  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Q2 Product Roadmap',
      description: 'Main product roadmap for Q2 2026',
      status: ProjectStatus.ACTIVE,
    },
  });

  // Create tasks across all statuses (realistic software team context)
  // Each column has 3-5 tasks with a mix of priorities, assignees, and story points
  const taskData = [
    // BACKLOG (5 tasks)
    { title: 'Investigate flaky E2E tests in CI pipeline', status: TaskStatus.BACKLOG, priority: TaskPriority.MEDIUM, assigneeId: sarah.id, position: 1, storyPoints: 3, description: 'Several Playwright tests are intermittently failing on CI but pass locally. Need to investigate timing issues and add proper wait conditions.' },
    { title: 'Evaluate migration from REST to tRPC for internal APIs', status: TaskStatus.BACKLOG, priority: TaskPriority.LOW, assigneeId: null, position: 2, storyPoints: 5, description: 'Research whether tRPC would reduce boilerplate for our internal API routes while maintaining type safety across the monorepo.' },
    { title: 'Add OpenTelemetry tracing to API endpoints', status: TaskStatus.BACKLOG, priority: TaskPriority.MEDIUM, assigneeId: null, position: 3, storyPoints: 8, description: 'Instrument NestJS controllers and services with OpenTelemetry spans for production observability. Export to Jaeger or Grafana Tempo.' },
    { title: 'Design mobile-responsive board layout for tablets', status: TaskStatus.BACKLOG, priority: TaskPriority.LOW, assigneeId: mike.id, position: 4, storyPoints: 5, description: 'Current board layout breaks on screens under 1024px. Design a responsive layout that stacks columns vertically on tablets with horizontal swipe.' },
    { title: 'Implement CSV/JSON export for task data', status: TaskStatus.BACKLOG, priority: TaskPriority.LOW, assigneeId: null, position: 5, storyPoints: 3, description: 'Allow workspace admins to export all tasks as CSV or JSON for reporting and backup purposes.' },

    // TODO (5 tasks)
    { title: 'Add role-based column visibility settings', status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: jerome.id, position: 1, storyPoints: 5, description: 'Allow workspace owners to configure which columns are visible per role. Viewers should not see the BACKLOG column by default.' },
    { title: 'Implement @mention autocomplete in comment editor', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, assigneeId: sarah.id, position: 2, storyPoints: 5, description: 'Add @mention support in the TipTap editor that shows a dropdown of workspace members and triggers a notification on submit.' },
    { title: 'Write integration tests for WebSocket gateway', status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: sarah.id, position: 3, storyPoints: 8, description: 'Add Socket.IO client tests that verify joinBoard auth, room broadcasting, and sender exclusion logic against a real test server.' },
    { title: 'Add bulk task operations (move, assign, delete)', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, assigneeId: jerome.id, position: 4, storyPoints: 8, description: 'Allow selecting multiple tasks via checkboxes and performing bulk operations. Needs optimistic UI updates and batch API endpoint.' },
    { title: 'Set up Sentry error monitoring for API and web', status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: anna.id, position: 5, storyPoints: 3, description: 'Integrate Sentry SDK in both NestJS and Next.js apps. Configure source maps upload in the build pipeline for readable stack traces.' },

    // IN_PROGRESS (4 tasks)
    { title: 'Build notification preferences settings page', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: sarah.id, position: 1, storyPoints: 5, description: 'Create a settings page where users can toggle notification types (assignment, comment, mention, due date reminder) on/off.' },
    { title: 'Implement drag-and-drop card reordering with optimistic updates', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, assigneeId: jerome.id, position: 2, storyPoints: 13, description: 'Wire up @dnd-kit sortable context with TanStack Query optimistic mutations. Position changes should reflect instantly and rollback on API error.' },
    { title: 'Design and implement dark mode color tokens', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, assigneeId: mike.id, position: 3, storyPoints: 5, description: 'Finalize the dark mode palette using CSS custom properties. Ensure sufficient contrast ratios (WCAG AA) for all text and interactive elements.' },
    { title: 'Add rich text comment threading with TipTap', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, assigneeId: sarah.id, position: 4, storyPoints: 8, description: 'Extend the comment system to support threaded replies. Each reply nests under its parent with indentation and a collapse toggle.' },

    // IN_REVIEW (4 tasks)
    { title: 'Implement WebSocket gateway with Redis pub-sub adapter', status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, assigneeId: sarah.id, position: 1, storyPoints: 13, description: 'Socket.IO gateway with JWT auth, room management, and Redis adapter for horizontal scaling. Includes sender exclusion and user-socket mapping.' },
    { title: 'Create analytics dashboard with Recharts', status: TaskStatus.IN_REVIEW, priority: TaskPriority.MEDIUM, assigneeId: mike.id, position: 2, storyPoints: 8, description: 'Interactive dashboard showing task distribution by status, priority breakdown pie chart, team workload bar chart, and velocity line chart.' },
    { title: 'Add AI-powered task parsing to command palette', status: TaskStatus.IN_REVIEW, priority: TaskPriority.MEDIUM, assigneeId: jerome.id, position: 3, storyPoints: 8, description: 'Integrate Anthropic Claude to parse natural language input like "Fix login bug, high priority, assign to Sarah, due Friday" into structured task fields.' },
    { title: 'Implement workspace invitation flow with email', status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, assigneeId: anna.id, position: 4, storyPoints: 5, description: 'Allow admins to invite users by email. Generate a signed invite token, send email via Bull queue, and handle the accept/decline flow.' },

    // DONE (5 tasks)
    { title: 'Set up CI/CD pipeline with GitHub Actions', status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: sarah.id, position: 1, storyPoints: 5, description: 'Configure GitHub Actions workflow for lint, type-check, unit tests, and build on every PR. Deploy to Railway on merge to main.' },
    { title: 'Configure PostgreSQL with Prisma migrations', status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: sarah.id, position: 2, storyPoints: 3, description: 'Set up Prisma schema, initial migration, and seed script. Configure connection pooling and schema isolation for multi-tenant safety.' },
    { title: 'Create design system component library', status: TaskStatus.DONE, priority: TaskPriority.MEDIUM, assigneeId: mike.id, position: 3, storyPoints: 8, description: 'Build reusable UI components (Button, Input, Card, Dialog, DropdownMenu, Avatar) using Radix UI primitives and Tailwind CSS v4.' },
    { title: 'Implement JWT authentication with refresh token rotation', status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: jerome.id, position: 4, storyPoints: 8, description: 'Implement access/refresh token pair with automatic rotation. Refresh tokens stored in Redis with TTL. Includes login, register, and token refresh endpoints.' },
    { title: 'Set up monorepo with pnpm workspaces', status: TaskStatus.DONE, priority: TaskPriority.MEDIUM, assigneeId: jerome.id, position: 5, storyPoints: 3, description: 'Configure pnpm workspaces for apps/api, apps/web, and packages/ directories. Set up shared TypeScript config and path aliases.' },
  ];

  const tasks = await Promise.all(
    taskData.map((t) =>
      prisma.task.create({
        data: {
          projectId: project.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId,
          reporterId: jerome.id,
          position: t.position,
          storyPoints: t.storyPoints,
          dueDate: new Date(Date.now() + (Math.random() * 30 - 5) * 24 * 60 * 60 * 1000), // Some tasks overdue (negative offset)
          // DONE tasks get a realistic completedAt (1-10 days ago)
          ...(t.status === TaskStatus.DONE && {
            completedAt: new Date(Date.now() - (1 + Math.floor(Math.random() * 10)) * 24 * 60 * 60 * 1000),
          }),
        },
      }),
    ),
  );

  // Attach labels to tasks (well-distributed across all labels)
  // [Bug, Feature, Enhancement, Documentation, Urgent]
  await Promise.all([
    // BACKLOG tasks
    prisma.taskLabel.create({ data: { taskId: tasks[0].id, labelId: labels[0].id } }),   // Flaky tests -> Bug
    prisma.taskLabel.create({ data: { taskId: tasks[2].id, labelId: labels[2].id } }),   // OpenTelemetry -> Enhancement
    prisma.taskLabel.create({ data: { taskId: tasks[4].id, labelId: labels[1].id } }),   // CSV export -> Feature

    // TODO tasks
    prisma.taskLabel.create({ data: { taskId: tasks[5].id, labelId: labels[1].id } }),   // Role-based columns -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[5].id, labelId: labels[2].id } }),   // Role-based columns -> Enhancement
    prisma.taskLabel.create({ data: { taskId: tasks[6].id, labelId: labels[1].id } }),   // @mention -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[7].id, labelId: labels[3].id } }),   // Integration tests -> Documentation
    prisma.taskLabel.create({ data: { taskId: tasks[9].id, labelId: labels[4].id } }),   // Sentry -> Urgent

    // IN_PROGRESS tasks
    prisma.taskLabel.create({ data: { taskId: tasks[11].id, labelId: labels[1].id } }),  // DnD reordering -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[11].id, labelId: labels[4].id } }),  // DnD reordering -> Urgent
    prisma.taskLabel.create({ data: { taskId: tasks[12].id, labelId: labels[2].id } }),  // Dark mode -> Enhancement
    prisma.taskLabel.create({ data: { taskId: tasks[13].id, labelId: labels[1].id } }),  // Comment threading -> Feature

    // IN_REVIEW tasks
    prisma.taskLabel.create({ data: { taskId: tasks[14].id, labelId: labels[1].id } }),  // WebSocket gateway -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[15].id, labelId: labels[1].id } }),  // Analytics -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[16].id, labelId: labels[1].id } }),  // AI parsing -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[16].id, labelId: labels[2].id } }),  // AI parsing -> Enhancement

    // DONE tasks
    prisma.taskLabel.create({ data: { taskId: tasks[18].id, labelId: labels[1].id } }),  // CI/CD -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[20].id, labelId: labels[3].id } }),  // Design system -> Documentation
    prisma.taskLabel.create({ data: { taskId: tasks[21].id, labelId: labels[1].id } }),  // JWT auth -> Feature
    prisma.taskLabel.create({ data: { taskId: tasks[21].id, labelId: labels[4].id } }),  // JWT auth -> Urgent
  ]);

  // Add comments on various tasks for a richer demo
  await Promise.all([
    prisma.comment.create({
      data: {
        taskId: tasks[11].id, // DnD reordering
        authorId: sarah.id,
        body: '<p>I tested the fractional indexing approach and it handles concurrent moves well. The rebalance kicks in correctly when gaps get too small. Ready for review once the optimistic rollback is wired up.</p>',
      },
    }),
    prisma.comment.create({
      data: {
        taskId: tasks[11].id, // DnD reordering
        authorId: jerome.id,
        body: '<p>Good catch on the edge case where dragging to an empty column wasn\'t setting the default position. Fixed in the latest push.</p>',
      },
    }),
    prisma.comment.create({
      data: {
        taskId: tasks[14].id, // WebSocket gateway
        authorId: jerome.id,
        body: '<p>The Redis pub-sub adapter is working well in local multi-instance testing. I spun up two API instances behind nginx and verified events propagate across both.</p>',
      },
    }),
    prisma.comment.create({
      data: {
        taskId: tasks[14].id, // WebSocket gateway
        authorId: anna.id,
        body: '<p>Should we add rate limiting to the WebSocket connection? I noticed in the logs that reconnection storms can happen when the API restarts.</p>',
      },
    }),
    prisma.comment.create({
      data: {
        taskId: tasks[16].id, // AI parsing
        authorId: mike.id,
        body: '<p>The AI parsing is really impressive! I tried "Create a high priority bug for the login page crashing on Safari, assign to Sarah, due next Monday" and it parsed everything correctly.</p>',
      },
    }),
    prisma.comment.create({
      data: {
        taskId: tasks[10].id, // Notification preferences
        authorId: anna.id,
        body: '<p>Can we add a "mute all" toggle at the top of the preferences page? Sometimes you just want to focus without any notifications.</p>',
      },
    }),
    prisma.comment.create({
      data: {
        taskId: tasks[7].id, // Integration tests for WS
        authorId: sarah.id,
        body: '<p>I\'ll use the Socket.IO test client with a real NestJS test module. We need to test: auth rejection, room join/leave, event broadcasting, and sender exclusion.</p>',
      },
    }),
  ]);

  // Create a second project
  await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Bug Fixes & Maintenance',
      description: 'Ongoing bug fixes and technical debt',
      status: ProjectStatus.ACTIVE,
    },
  });

  console.log('Seed completed successfully!');
  console.log(`  - ${users.length} users`);
  console.log(`  - 1 workspace with ${users.length} members`);
  console.log(`  - ${labels.length} labels`);
  console.log(`  - 2 projects`);
  console.log(`  - ${tasks.length} tasks (with story points and realistic descriptions)`);
  console.log(`  - 7 comments across tasks`);
  console.log(`  - 20 label attachments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
