export interface TaskEvent {
  taskId: string;
  projectId: string;
  userId: string;
  data: any;
}

export interface SprintEvent {
  projectId: string;
  sprintId: string;
  nextSprintId: string | null;
}

export interface NotificationEvent {
  recipientId: string;
  notification: any;
}
