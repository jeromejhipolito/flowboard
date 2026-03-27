import { z } from 'zod';
import { TaskStatus, TaskPriority, WorkspaceRole } from './enums';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(WorkspaceRole),
});

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  parentTaskId: z.string().uuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const moveTaskSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  position: z.number(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1),
  parentCommentId: z.string().uuid().optional(),
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
