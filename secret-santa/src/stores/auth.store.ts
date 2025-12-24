import { createSignal } from 'solid-js';
import authService from '../services/auth.service';
import type { User } from '../types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const [authState, setAuthState] = createSignal<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

const authStore = {
  // Getters
  get user() {
    return authState().user;
  },
  get isAuthenticated() {
    return authState().isAuthenticated;
  },
  get isLoading() {
    return authState().isLoading;
  },

  // Actions
  async login(email: string, password: string) {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login({ email, password });
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Update state
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  async register(email: string, password: string, name: string) {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.register({ email, password, name });
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Update state
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  async logout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  async telegramLogin(authData: any) {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.telegramAuth(authData);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Update state
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // Initialize auth state from stored tokens
  initializeAuth() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // For now, we'll just set loading to false
    // In a real app, we might verify the token with the server
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: !!(accessToken && refreshToken),
      isLoading: false
    }));
  },

  // Update user data
  updateUser(userData: Partial<User>) {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null
    }));
  }
};

export default authStore;