'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { createElement } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  timezone?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh');

      localStorage.setItem('access_token', data.accessToken);
      document.cookie = 'fb_logged_in=1; path=/; max-age=604800; samesite=strict';

      const { data: user } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });

      setState({
        user,
        accessToken: data.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem('access_token');
      document.cookie = 'fb_logged_in=; path=/; max-age=0';
      setState({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // On mount: try existing access_token first, only refresh if that fails
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = localStorage.getItem('access_token');

      if (existingToken) {
        try {
          // Verify existing token by fetching user profile
          const { data: user } = await api.get('/auth/me');
          setState({
            user,
            accessToken: existingToken,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        } catch {
          // Token expired — try refresh
          try {
            await refreshToken();
            return;
          } catch {
            // Refresh also failed — fall through to unauthenticated
          }
        }
      }

      // No token or all attempts failed — set unauthenticated (but don't clear fb_logged_in aggressively)
      setState({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    };

    initAuth();
  }, [refreshToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('access_token', data.accessToken);
      document.cookie = 'fb_logged_in=1; path=/; max-age=604800; samesite=strict';

      setState({
        user: data.user,
        accessToken: data.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });

      router.push('/workspaces');
    },
    [router],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ) => {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });

      localStorage.setItem('access_token', data.accessToken);
      document.cookie = 'fb_logged_in=1; path=/; max-age=604800; samesite=strict';

      setState({
        user: data.user,
        accessToken: data.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });

      router.push('/workspaces');
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed with local cleanup even if API call fails
    }

    localStorage.removeItem('access_token');
    document.cookie = 'fb_logged_in=; path=/; max-age=0';

    setState({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
    });

    router.push('/login');
  }, [router]);

  return createElement(
    AuthContext.Provider,
    {
      value: {
        ...state,
        login,
        register,
        logout,
        refreshToken,
      },
    },
    children,
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
