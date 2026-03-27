import { WorkspaceRole, TaskStatus, TaskPriority } from './enums';

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  [WorkspaceRole.OWNER]: 4,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.MEMBER]: 2,
  [WorkspaceRole.VIEWER]: 1,
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'Backlog',
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.DONE]: 'Done',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '#22c55e',
  [TaskPriority.MEDIUM]: '#eab308',
  [TaskPriority.HIGH]: '#f97316',
  [TaskPriority.URGENT]: '#ef4444',
};

export const WS_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Workspace
  JOIN_WORKSPACE: 'workspace:join',
  LEAVE_WORKSPACE: 'workspace:leave',
  WORKSPACE_UPDATED: 'workspace:updated',
  MEMBER_JOINED: 'workspace:member_joined',
  MEMBER_LEFT: 'workspace:member_left',

  // Project
  JOIN_PROJECT: 'project:join',
  LEAVE_PROJECT: 'project:leave',
  PROJECT_UPDATED: 'project:updated',

  // Task
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',

  // Comment
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',

  // Notification
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Presence
  USER_ONLINE: 'presence:online',
  USER_OFFLINE: 'presence:offline',
  USER_TYPING: 'presence:typing',
} as const;
