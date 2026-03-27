export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  MENTION = 'MENTION',
  MEMBER_INVITED = 'MEMBER_INVITED',
}

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  STATUS_CHANGED = 'STATUS_CHANGED',
}
