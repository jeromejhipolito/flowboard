# Phase 3 — Notifications, Activity Log & Comments

**Duration:** ~1.5 weeks
**Goal:** Full collaboration features — audit trail, threaded comments, real-time notifications

---

## Step 3.1: Audit Log System (Backend)

- [ ] Create `AuditModule`
- [ ] Implement `AuditService.log()`:
  - Params: `actorId, resourceType, resourceId, action, before, after`
  - Writes to `AuditLog` table with JSON snapshots
- [ ] Integrate with Bull queue (`audit-queue`):
  - Task/Project mutations emit to queue (non-blocking)
  - Queue processor writes audit log entries async
  - Failed jobs → dead letter queue with retry metadata
- [ ] Hook into existing services:
  - TaskService: log on create, update, status change, delete
  - ProjectService: log on create, update, archive
  - WorkspaceMembership: log on invite, role change, remove
- [ ] Endpoints:
  - `GET /tasks/:id/activity` — paginated activity feed for a task
  - `GET /projects/:id/activity` — project-wide activity feed
  - Returns: actor name+avatar, action verb, field changes, timestamp

## Step 3.2: Comment System (Backend)

- [ ] Add to `TasksModule` or create `CommentsModule`
- [ ] Endpoints:
  - `POST /tasks/:id/comments` — create comment (body text, optional parentCommentId)
  - `GET /tasks/:id/comments` — list comments (threaded: top-level + nested replies)
  - `PATCH /comments/:id` — edit own comment (sets `editedAt`)
  - `DELETE /comments/:id` — delete own comment or ADMIN+ (soft delete)
- [ ] @mention parsing:
  - Parse `@username` patterns in comment body
  - Resolve to user IDs
  - Trigger notification creation for each mentioned user
- [ ] Emit WebSocket event `comment:created` to `board:{projectId}` room

## Step 3.3: Notification System (Backend)

- [ ] Create `NotificationsModule`
- [ ] Notification types enum:
  - `TASK_ASSIGNED` — you were assigned to a task
  - `TASK_STATUS_CHANGED` — a task you're assigned to changed status
  - `COMMENT_ADDED` — someone commented on your task
  - `MENTION` — you were @mentioned in a comment
  - `MEMBER_INVITED` — you were invited to a workspace
- [ ] Implement `NotificationService`:
  - `create()` — write to DB + push via WebSocket
  - `markAsRead(id)` — set `read: true`, `readAt: now`
  - `markAllAsRead(userId)` — batch update
- [ ] Bull queue (`notification-queue`):
  - Domain events (task assigned, comment created) → queue
  - Processor creates Notification records + emits WebSocket event
  - Decoupled from business logic
- [ ] Endpoints:
  - `GET /notifications` — paginated, filterable by read/unread
  - `PATCH /notifications/:id/read` — mark single as read
  - `PATCH /notifications/read-all` — mark all as read
  - `GET /notifications/unread-count` — for badge number
- [ ] WebSocket: emit `notification:new` to user's personal room `user:{userId}`

## Step 3.4: Activity Feed UI (Frontend)

- [ ] Add to task detail panel (Phase 2's slide-over):
  - Activity tab showing chronological feed
  - Each entry: avatar, "Jerome moved this task to Done", relative timestamp
  - Color-coded action types (created=green, moved=blue, deleted=red)
- [ ] Project-level activity page: `app/(dashboard)/.../projects/[id]/activity/page.tsx`
  - Filterable by: action type, actor, date range
  - Infinite scroll pagination
  - Server Component with Suspense boundary

## Step 3.5: Comments UI (Frontend)

- [ ] Add comment section to task detail panel (below activity)
- [ ] Comment input:
  - Textarea with @mention autocomplete (trigger on `@` keystroke)
  - User search dropdown with avatars
  - Submit with Ctrl+Enter
- [ ] Comment display:
  - Threaded view: top-level comments with collapsible replies
  - Each comment: avatar, name, relative time, edit/delete actions (own comments)
  - "Edited" badge if `editedAt` exists
- [ ] Real-time: new comments appear via WebSocket without refresh

## Step 3.6: Notification Center UI (Frontend)

- [ ] Notification bell in dashboard top bar:
  - Badge showing unread count (WebSocket-updated)
  - Animate badge on new notification (subtle pulse)
- [ ] Click bell → slide-out notification panel:
  - Grouped by date (Today, Yesterday, This Week, Older)
  - Each notification: avatar, message, timestamp, read/unread dot
  - Click notification → navigate to relevant task/project
  - "Mark all as read" button at top
- [ ] `useSocket()` hook extended:
  - Join personal room `user:{userId}` on app mount
  - Listen for `notification:new` → update TanStack Query cache + show toast
- [ ] Toast notifications:
  - Brief toast in bottom-right for new notifications
  - Auto-dismiss after 5 seconds, click to navigate

## Step 3.7: Scheduled Digest (Backend — Stretch)

- [ ] Use `@nestjs/schedule` for weekly digest:
  - Every Monday 9am: collect unread notifications from past 7 days
  - Group by workspace → project → action type
  - Log digest (email integration is stretch — log output for now)
- [ ] This demonstrates cron job scheduling in NestJS for interviews

## Completion Criteria
- Every task mutation creates an audit log entry (visible in activity feed)
- Comments work with threading and @mentions
- @mention creates a notification for the mentioned user
- Notification bell shows real-time unread count
- Notification panel lists all notifications with navigation
- Toast appears in real-time when receiving a notification
