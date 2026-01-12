// frontend/src/contexts/auth/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ApiClient } from '../../lib/api/client';
import { AuthService } from '../../lib/api/auth';

export interface User {
  id: number;
  name: string;
  email?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  forceRefreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
  apiClient: ApiClient;
  authService: AuthService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, apiClient, authService }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with true to check auth status on mount
    error: null,
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to refresh token to check if user is authenticated
      const response = await authService.refreshToken();

      if (response.data && response.data.userProfile) {
        dispatch({ type: 'SET_USER', payload: response.data.userProfile });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login({ email, password });

      if (response.data && response.data.userProfile) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.data.userProfile } });
      } else {
        throw new Error('Login failed - invalid response format');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await authService.register({ email, password, name: name || email.split('@')[0] });

      if (response.data && response.data.userProfile) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: { user: response.data.userProfile } });
      } else {
        throw new Error('Registration failed - invalid response format');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      if (response.data && response.data.userProfile) {
        dispatch({ type: 'SET_USER', payload: response.data.userProfile });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  // Force refresh the auth state by calling the checkAuth function
  const forceRefreshAuth = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.refreshToken();
      if (response.data && response.data.userProfile) {
        dispatch({ type: 'SET_USER', payload: response.data.userProfile });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    forceRefreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};