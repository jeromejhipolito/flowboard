'use client';

import { useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createElement } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '@/hooks/use-auth';
import { DEMO_CURRENT_USER } from '@/demo/data/users';

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const login = useCallback(
    async (_email: string, _password: string) => {
      toast.info('This is a demo — you are already logged in.');
      router.push('/workspaces');
    },
    [router],
  );

  const register = useCallback(
    async (
      _email: string,
      _password: string,
      _firstName: string,
      _lastName: string,
    ) => {
      toast.info('This is a demo — you are already logged in.');
      router.push('/workspaces');
    },
    [router],
  );

  const logout = useCallback(async () => {
    toast.info('Demo mode — you cannot log out.');
  }, []);

  const refreshToken = useCallback(async () => {
    // No-op in demo mode
  }, []);

  return createElement(
    AuthContext.Provider,
    {
      value: {
        user: DEMO_CURRENT_USER,
        accessToken: 'demo-token',
        isLoading: false,
        isAuthenticated: true,
        login,
        register,
        logout,
        refreshToken,
      },
    },
    children,
  );
}
