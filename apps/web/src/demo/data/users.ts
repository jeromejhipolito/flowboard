export interface DemoUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-user-1',
    email: 'alex.rivera@meridian.dev',
    firstName: 'Alex',
    lastName: 'Rivera',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
  },
  {
    id: 'demo-user-2',
    email: 'samantha.cho@meridian.dev',
    firstName: 'Samantha',
    lastName: 'Cho',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Samantha',
  },
  {
    id: 'demo-user-3',
    email: 'marcus.webb@meridian.dev',
    firstName: 'Marcus',
    lastName: 'Webb',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus',
  },
  {
    id: 'demo-user-4',
    email: 'priya.nair@meridian.dev',
    firstName: 'Priya',
    lastName: 'Nair',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
  },
  {
    id: 'demo-user-5',
    email: 'jordan.lee@meridian.dev',
    firstName: 'Jordan',
    lastName: 'Lee',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
  },
];

export const DEMO_CURRENT_USER = DEMO_USERS[0];
