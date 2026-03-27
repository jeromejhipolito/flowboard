import type { Comment } from '@/hooks/use-comments';

export const DEMO_COMMENTS: Comment[] = [
  // Redis cache refactor (demo-task-6) — 3 comments
  {
    id: 'demo-comment-1',
    taskId: 'demo-task-6',
    authorId: 'demo-user-1',
    author: {
      id: 'demo-user-1',
      firstName: 'Alex',
      lastName: 'Rivera',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    },
    body: 'I have started migrating the cache helpers. The main challenge is that our existing key naming convention does not account for hash slots. Going to introduce a `{prefix}:` pattern so related keys land on the same shard.',
    parentCommentId: null,
    createdAt: '2026-03-22T10:30:00.000Z',
    updatedAt: '2026-03-22T10:30:00.000Z',
    editedAt: null,
  },
  {
    id: 'demo-comment-2',
    taskId: 'demo-task-6',
    authorId: 'demo-user-3',
    author: {
      id: 'demo-user-3',
      firstName: 'Marcus',
      lastName: 'Webb',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus',
    },
    body: 'Good call on the hash tags. Make sure we also update the session store — it currently assumes single-node SCAN which does not work in cluster mode.',
    parentCommentId: 'demo-comment-1',
    createdAt: '2026-03-22T11:15:00.000Z',
    updatedAt: '2026-03-22T11:15:00.000Z',
    editedAt: null,
  },
  {
    id: 'demo-comment-3',
    taskId: 'demo-task-6',
    authorId: 'demo-user-2',
    author: {
      id: 'demo-user-2',
      firstName: 'Samantha',
      lastName: 'Cho',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Samantha',
    },
    body: 'Heads up — the dashboard widget cache keys will need updating too. I will handle that as part of the chart migration (demo-task-14) so we do not duplicate effort.',
    parentCommentId: null,
    createdAt: '2026-03-23T09:00:00.000Z',
    updatedAt: '2026-03-23T09:00:00.000Z',
    editedAt: null,
  },
  // Rate limiting (demo-task-13) — 2 comments
  {
    id: 'demo-comment-4',
    taskId: 'demo-task-13',
    authorId: 'demo-user-3',
    author: {
      id: 'demo-user-3',
      firstName: 'Marcus',
      lastName: 'Webb',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus',
    },
    body: 'PR is up. I went with a sliding window algorithm using sorted sets in Redis. Default limit is 100 req/min per API key. Enterprise keys get 500/min. The rate limit headers (X-RateLimit-Remaining, Retry-After) are included in every response.',
    parentCommentId: null,
    createdAt: '2026-03-24T14:00:00.000Z',
    updatedAt: '2026-03-24T14:00:00.000Z',
    editedAt: null,
  },
  {
    id: 'demo-comment-5',
    taskId: 'demo-task-13',
    authorId: 'demo-user-1',
    author: {
      id: 'demo-user-1',
      firstName: 'Alex',
      lastName: 'Rivera',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    },
    body: 'Looks solid. One thing — can we add a bypass for internal service-to-service calls so the event processor does not get throttled? We can check for a shared internal header.',
    parentCommentId: 'demo-comment-4',
    createdAt: '2026-03-24T15:30:00.000Z',
    updatedAt: '2026-03-24T15:30:00.000Z',
    editedAt: null,
  },
  // Flaky test (demo-task-9) — 2 comments
  {
    id: 'demo-comment-6',
    taskId: 'demo-task-9',
    authorId: 'demo-user-3',
    author: {
      id: 'demo-user-3',
      firstName: 'Marcus',
      lastName: 'Webb',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus',
    },
    body: 'Found the root cause — the token mock was sharing state across parallel test workers. Switching to per-test transaction rollback with isolated mocks. CI is green on 5 consecutive runs now.',
    parentCommentId: null,
    createdAt: '2026-03-24T16:00:00.000Z',
    updatedAt: '2026-03-24T16:00:00.000Z',
    editedAt: null,
  },
  {
    id: 'demo-comment-7',
    taskId: 'demo-task-9',
    authorId: 'demo-user-5',
    author: {
      id: 'demo-user-5',
      firstName: 'Jordan',
      lastName: 'Lee',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
    },
    body: 'Nice find. Can we add a lint rule or CI check to prevent shared mutable test state in the future? That pattern has bitten us three times this quarter.',
    parentCommentId: 'demo-comment-6',
    createdAt: '2026-03-25T08:30:00.000Z',
    updatedAt: '2026-03-25T08:30:00.000Z',
    editedAt: null,
  },
  // Date range picker (demo-task-7) — 1 comment
  {
    id: 'demo-comment-8',
    taskId: 'demo-task-7',
    authorId: 'demo-user-4',
    author: {
      id: 'demo-user-4',
      firstName: 'Priya',
      lastName: 'Nair',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
    },
    body: 'This component should expose preset ranges (Last 7 days, Last 30 days, This sprint) in addition to the custom picker. That will cover 90% of use cases without any extra clicks.',
    parentCommentId: null,
    createdAt: '2026-03-24T10:00:00.000Z',
    updatedAt: '2026-03-24T10:00:00.000Z',
    editedAt: null,
  },
];

/** Get comments for a specific task */
export function getDemoComments(taskId: string) {
  return {
    comments: DEMO_COMMENTS.filter((c) => c.taskId === taskId),
  };
}
