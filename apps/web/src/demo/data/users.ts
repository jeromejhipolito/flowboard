export interface DemoUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  timezone?: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-user-1',
    email: 'alex.rivera@meridian.dev',
    firstName: 'Alex',
    lastName: 'Rivera',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    timezone: 'Asia/Manila',
  },
  {
    id: 'demo-user-2',
    email: 'samantha.cho@meridian.dev',
    firstName: 'Samantha',
    lastName: 'Cho',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Samantha',
    timezone: 'America/New_York',
  },
  {
    id: 'demo-user-3',
    email: 'marcus.webb@meridian.dev',
    firstName: 'Marcus',
    lastName: 'Webb',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'demo-user-4',
    email: 'priya.nair@meridian.dev',
    firstName: 'Priya',
    lastName: 'Nair',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
    timezone: 'Europe/London',
  },
  {
    id: 'demo-user-5',
    email: 'jordan.lee@meridian.dev',
    firstName: 'Jordan',
    lastName: 'Lee',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
    timezone: 'America/Chicago',
  },
];

export const DEMO_CURRENT_USER = DEMO_USERS[0];
