import type { DemoUser } from './users';
import { DEMO_USERS } from './users';

export interface DemoWorkspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  memberCount?: number;
  role?: string;
}

export interface DemoWorkspaceMember {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  timezone?: string;
}

export const DEMO_WORKSPACE: DemoWorkspace = {
  id: 'demo-workspace-1',
  name: 'Lakbay Tech',
  slug: 'lakbay-tech',
  description: 'Building scalable SaaS products for global remote teams.',
  memberCount: 5,
  role: 'OWNER',
};

export const DEMO_WORKSPACES: DemoWorkspace[] = [DEMO_WORKSPACE];

function toMember(user: DemoUser, role: string): DemoWorkspaceMember {
  return {
    id: `demo-member-${user.id}`,
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role,
    avatarUrl: user.avatarUrl,
    timezone: user.timezone,
  };
}

export const DEMO_WORKSPACE_MEMBERS: DemoWorkspaceMember[] = [
  toMember(DEMO_USERS[0], 'OWNER'),
  toMember(DEMO_USERS[1], 'ADMIN'),
  toMember(DEMO_USERS[2], 'MEMBER'),
  toMember(DEMO_USERS[3], 'MEMBER'),
  toMember(DEMO_USERS[4], 'MEMBER'),
];
