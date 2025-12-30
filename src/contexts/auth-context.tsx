'use client';

import { createContext, useContext, useState, useCallback, useEffect, useLayoutEffect, startTransition, ReactNode } from 'react';
import type { CurrentUserResponse, LoginResponse } from '@/types/auth';

interface AuthState {
  user: CurrentUserResponse | null;
  token: string | null;
  refreshToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  getUser: () => CurrentUserResponse | null;
  setUser: (user: CurrentUserResponse) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  refreshAuth: (token: string, refreshToken: string) => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_REFRESH_TOKEN_KEY = 'auth-refresh-token';

const getAuthFromStorage = (): { token: string | null; refreshToken: string | null } => {
  if (typeof window === 'undefined') {
    return { token: null, refreshToken: null };
  }

  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    return {
      token: token ? token : null,
      refreshToken: refreshToken ? refreshToken : null
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { token: null, refreshToken: null };
  }
};

const saveAuthToStorage = (token: string, refreshToken: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const clearAuthFromStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    token: null,
    refreshToken: null
  }));

  const [isInitialized, setIsInitialized] = useState(false);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = getAuthFromStorage();
      startTransition(() => {
        setState({
          user: null,
          token: storedAuth.token,
          refreshToken: storedAuth.refreshToken
        });
        setIsInitialized(true);
      });
    }
  }, []);

  const login = useCallback((loginResponse: LoginResponse) => {
    if (loginResponse.status === 'success') {
      const userData: CurrentUserResponse = {
        user_id: loginResponse.data.user.id,
        username: loginResponse.data.user.username,
        email: '',
        full_name: loginResponse.data.user.fullName,
        role_id: '',
        role: loginResponse.data.user.role,
        permissions: loginResponse.data.user.permissions
      };

      saveAuthToStorage(loginResponse.data.token, loginResponse.data.refreshToken);

      setState({
        user: userData,
        token: loginResponse.data.token,
        refreshToken: loginResponse.data.refreshToken
      });
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthFromStorage();

    setState({
      user: null,
      token: null,
      refreshToken: null
    });
  }, []);

  const getToken = useCallback(() => {
    return state.token;
  }, [state.token]);

  const getRefreshToken = useCallback(() => {
    return state.refreshToken;
  }, [state.refreshToken]);

  const getUser = useCallback(() => {
    return state.user;
  }, [state.user]);

  const setUser = useCallback((user: CurrentUserResponse) => {
    setState((prev) => ({
      ...prev,
      user
    }));
  }, []);

  const setToken = useCallback((token: string | null) => {
    setState((prev) => ({
      ...prev,
      token
    }));
  }, []);

  const setRefreshToken = useCallback((refreshToken: string | null) => {
    setState((prev) => ({
      ...prev,
      refreshToken
    }));
  }, []);

  const refreshAuth = useCallback((newToken: string, newRefreshToken: string) => {
    saveAuthToStorage(newToken, newRefreshToken);
    setState((prev) => ({
      ...prev,
      token: newToken,
      refreshToken: newRefreshToken
    }));
  }, []);

  useEffect(() => {
    if (state.token && state.refreshToken) {
      saveAuthToStorage(state.token, state.refreshToken);
    } else if (!state.token && !state.refreshToken && isInitialized) {
      clearAuthFromStorage();
    }
  }, [state.token, state.refreshToken, isInitialized]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        getToken,
        getRefreshToken,
        getUser,
        setUser,
        setToken,
        setRefreshToken,
        refreshAuth,
        isInitialized
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
