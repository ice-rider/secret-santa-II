import axios from 'axios';
import { API_BASE_URL } from './api';
import type { LoginCredentials, RegisterData, LoginResponse, TelegramAuthData } from '../types';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/auth`;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post(`${this.baseUrl}/login`, credentials);
    return response.data;
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await axios.post(`${this.baseUrl}/register`, userData);
    return response.data;
  }

  async logout(): Promise<void> {
    await axios.post(`${this.baseUrl}/logout`);
    // Clear tokens from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.baseUrl}/refresh`, {
      refreshToken
    });
    
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  }

  async googleAuthUrl(): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/google/url`);
    return response.data.url;
  }

  async githubAuthUrl(): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/github/url`);
    return response.data.url;
  }

  async telegramAuth(authData: TelegramAuthData): Promise<LoginResponse> {
    const response = await axios.post(`${this.baseUrl}/telegram`, authData);
    return response.data;
  }
}

export default new AuthService();