import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { ApiClient } from '../../lib/api/client';
import { AuthService } from '../../lib/api/auth';

export interface User {
  id: string;
  email: string;
  name?: string;
  // Add other user properties as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  authenticateWithToken: (token: string) => void;
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
    isLoading: false,
    error: null,
  });

  const authenticateWithToken = (token: string) => {
    try {
      // Decode the token to get user info (in a real app, you might decode JWT)
      // For now, we'll just set a placeholder user
      // In a real implementation, you'd verify the token with your backend
      apiClient.setAuthToken(token);
      
      // You might want to fetch user details from the API here
      // const userResponse = await apiClient.get('/auth/me');
      // const user = userResponse.data;
      
      // For now, we'll use a placeholder
      const user: User = {
        id: 'temp-id', // This would come from the token or API call
        email: 'temp@example.com', // This would come from the token or API call
        name: 'Temp User', // This would come from the token or API call
      };
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Failed to authenticate with token' 
      });
    }
  };

  // Check for existing token on initialization
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authenticateWithToken(token);
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // For mock implementation, we'll simulate a successful login
      // In a real app, you would call the actual API
      const mockToken = 'mock-jwt-token-for-testing';
      const mockUser = {
        id: '1',
        email: email,
        name: email.split('@')[0] // Use part of email as name
      };

      // Store the token in the API client
      apiClient.setAuthToken(mockToken);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: mockUser, token: mockToken }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      // For mock implementation, we'll simulate a successful registration
      // In a real app, you would call the actual API
      const mockToken = 'mock-jwt-token-for-testing';
      const mockUser = {
        id: '1',
        email: email,
        name: name || email.split('@')[0] // Use name if provided, otherwise part of email
      };

      // Store the token in the API client
      apiClient.setAuthToken(mockToken);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user: mockUser, token: mockToken }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  };

  const logout = () => {
    // Clear tokens from API client and storage
    apiClient.removeAuthToken();
    
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = async () => {
    try {
      // This would call the refresh endpoint
      // const response = await authService.refreshToken();
      // if (response.status === 200) {
      //   const { token, user } = response.data;
      //   apiClient.setAuthToken(token);
      //   dispatch({ 
      //     type: 'LOGIN_SUCCESS', 
      //     payload: { user, token } 
      //   });
      // }
    } catch (error) {
      logout(); // If refresh fails, log out the user
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    authenticateWithToken,
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