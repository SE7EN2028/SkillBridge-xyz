import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/lib/endpoints';
import { tokenStore } from '@/lib/api';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: 'WORKER' | 'EMPLOYER';
  }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

const USER_KEY = 'sb_user';

const persistUser = (u: User | null): void => {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
};

const readUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [user, setUser] = useState<User | null>(() => readUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    persistUser(user);
  }, [user]);

  const handleAuthResult = useCallback(
    (data: { accessToken: string; refreshToken: string; user: User }) => {
      tokenStore.setAccess(data.accessToken);
      tokenStore.setRefresh(data.refreshToken);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const login = useCallback<AuthState['login']>(
    async (email, password) => {
      setLoading(true);
      try {
        const data = await authApi.login({ email, password });
        return handleAuthResult(data);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthResult],
  );

  const register = useCallback<AuthState['register']>(
    async (input) => {
      setLoading(true);
      try {
        const data = await authApi.register(input);
        return handleAuthResult(data);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthResult],
  );

  const logout = useCallback<AuthState['logout']>(async () => {
    const rt = tokenStore.getRefresh();
    if (rt) {
      try {
        await authApi.logout(rt);
      } catch {
        /* ignore */
      }
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
