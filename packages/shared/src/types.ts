import {
  WorkspaceRole,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  NotificationType,
  AuditAction,
} from './enums';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  user: User;
  invitedAt: string;
  joinedAt: string | null;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  reporterId: string;
  position: number;
  dueDate: string | null;
  storyPoints: number | null;
  labels: Label[];
  assignee: User | null;
  reporter: User;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  parentCommentId: string | null;
  body: string;
  editedAt: string | null;
  author: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  resourceType: string;
  resourceId: string;
  read: boolean;
  readAt: string | null;
  actor: User;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  action: AuditAction;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  occurredAt: string;
  actor: User;
}
