# WebSocket Event Reference

FlowBoard uses [Socket.IO](https://socket.io/) over WebSocket for real-time collaboration. This document covers every event, its payload, direction, and the rooms involved.

---

## Authentication

Clients authenticate by passing a JWT access token in the Socket.IO handshake:

```ts
import { io } from 'socket.io-client';

const socket = io(WS_URL, {
  auth: {
    token: accessToken, // JWT access token
  },
});
```

The gateway verifies the token on connection via `jsonwebtoken.verify()`. If verification fails, the socket is immediately disconnected. On success the server:

1. Extracts `userId` from the JWT `sub` claim
2. Stores `userId` on `socket.data.userId`
3. Auto-joins the socket to the personal notification room `user:{userId}`

Alternatively, the token can be sent as a `Bearer` token in the `Authorization` header of the handshake.

---

## Room Naming Convention

| Room Pattern | Purpose | Joined When |
|---|---|---|
| `board:{projectId}` | Broadcast task events for a specific project board | Client emits `joinBoard` |
| `user:{userId}` | Deliver personal notifications to a specific user | Automatically on connection |

---

## Event Table

| Event | Direction | Payload | Trigger | Recipients |
|-------|-----------|---------|---------|------------|
| `joinBoard` | client --> server | `{ projectId: string }` | Board page mount | N/A (server-side room join) |
| `leaveBoard` | client --> server | `{ projectId: string }` | Board page unmount | N/A (server-side room leave) |
| `task:created` | server --> client | `TaskEvent` | Task created via API | `board:{projectId}` room (excl. sender) |
| `task:updated` | server --> client | `TaskEvent` | Task field updated via API | `board:{projectId}` room (excl. sender) |
| `task:moved` | server --> client | `TaskMovedEvent` | Task moved between columns via API | `board:{projectId}` room (excl. sender) |
| `task:deleted` | server --> client | `TaskEvent` | Task soft-deleted via API | `board:{projectId}` room (excl. sender) |
| `notification:new` | server --> client | `NotificationEvent` | Task assigned, comment, mention | `user:{userId}` room |
| `error` | server --> client | `ErrorEvent` | Auth failure, forbidden room access | Specific client only |

---

## TypeScript Interfaces

### JoinBoard / LeaveBoard Payload (Client --> Server)

```ts
interface JoinBoardPayload {
  projectId: string;
}

interface LeaveBoardPayload {
  projectId: string;
}
```

### TaskEvent (Server --> Client)

Used for `task:created`, `task:updated`, and `task:deleted` events.

```ts
interface TaskEvent {
  /** UUID of the affected task */
  taskId: string;

  /** UUID of the project the task belongs to (determines broadcast room) */
  projectId: string;

  /** UUID of the user who performed the action (used for sender exclusion) */
  userId: string;

  /** The full task object (for created/updated) or `{ task }` wrapper (for deleted) */
  data: any;
}
```

### TaskMovedEvent (Server --> Client)

Used for the `task:moved` event. Contains previous and new position/status information.

```ts
interface TaskMovedEvent {
  taskId: string;
  projectId: string;
  userId: string;
  data: {
    previousStatus: TaskStatus;
    previousPosition: number;
    newStatus: TaskStatus;
    newPosition: number;
  };
}

type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
```

### NotificationEvent (Server --> Client)

Used for the `notification:new` event.

```ts
interface NotificationEvent {
  /** UUID of the user who should receive the notification */
  recipientId: string;

  /** The full notification object */
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    [key: string]: any;
  };
}
```

### ErrorEvent (Server --> Client)

Emitted directly to the offending client when a room join fails.

```ts
interface ErrorEvent {
  /** Error code: 'NOT_FOUND' | 'FORBIDDEN' */
  code: string;

  /** Human-readable error message */
  message: string;
}
```

---

## Event Flow: Real-Time Task Move

```
Client A                  NestJS API              EventEmitter          WebSocket Gateway         Client B
   |                          |                        |                       |                      |
   |-- PATCH /tasks/:id/move->|                        |                       |                      |
   |                          |-- Update DB ---------->|                       |                      |
   |                          |-- emit('task.moved') ->|                       |                      |
   |<-- 200 OK (confirmed) ---|                        |                       |                      |
   |                          |                        |-- @OnEvent('task.moved')                     |
   |                          |                        |                       |-- emit('task:moved') ->|
   |                          |                        |                       |                      |
   |                          |                        |                       |    Update TanStack   |
   |                          |                        |                       |    Query cache       |
```

---

## Sender Exclusion

All task events exclude the originating user's sockets from the broadcast. This prevents the sender from receiving their own optimistic update back from the server.

The gateway maintains a `Map<string, Set<string>>` mapping `userId` to active socket IDs. When broadcasting, it uses Socket.IO's `.except(socketIds)` to exclude all of the sender's connections (supports multiple tabs/devices).

---

## Redis Adapter (Horizontal Scaling)

The gateway uses `@socket.io/redis-adapter` to enable pub/sub across multiple API instances. On initialization, it creates dedicated Redis pub/sub clients so that events emitted on one server instance are delivered to clients connected to any instance.

---

## Client-Side Integration Example

```ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/lib/socket';

function useBoardSocket(projectId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.emit('joinBoard', { projectId });

    socket.on('task:created', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    });

    socket.on('task:updated', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    });

    socket.on('task:moved', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    });

    socket.on('task:deleted', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    });

    return () => {
      socket.emit('leaveBoard', { projectId });
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:moved');
      socket.off('task:deleted');
    };
  }, [projectId, queryClient]);
}
```
