export const AUTH_CREDENTIALS = {
  admin: {
    login: 'admin',
    password: 'admin123',
    role: 'admin' as const,
  },
  worker: {
    login: 'worker',
    password: 'worker123',
    role: 'worker' as const,
  },
};

export type UserRole = 'admin' | 'worker';
export type UserLocation = 'шатой' | 'гикало';

export interface User {
  role: UserRole;
  location?: UserLocation;
}

