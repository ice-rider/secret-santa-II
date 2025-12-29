import { createContext, createEffect, useContext } from 'solid-js';
import authStore from './stores/auth.store';
import type { AuthState } from './stores/auth.store';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  telegramLogin: (authData: any) => Promise<{ success: boolean; error?: string }>;
  initializeAuth: () => void;
  updateUser: (userData: Partial<import('./types').User>) => void;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider = (props: { children?: import('solid-js').JSX.Element }) => {
  // Initialize auth state when the app loads
  createEffect(() => {
    authStore.initializeAuth();
  });

  return (
    <AuthContext.Provider value={authStore}>
      {props.children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};