import { ApiClient } from './client';
import type { ApiResponse } from './client';

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface OAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface TelegramAuthRequest {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramAuthResponse {
  token: string;
  user: {
    id: string;
    email?: string;
    name: string;
  };
}

export class AuthService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  getApiClient(): ApiClient {
    return this.apiClient;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.apiClient.post('/auth/register', data);
  }

  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.apiClient.post('/auth/login', data);
  }

  async googleAuth(token: string): Promise<ApiResponse<OAuthResponse>> {
    return this.apiClient.post('/auth/google', { token });
  }

  async githubAuth(code: string): Promise<ApiResponse<OAuthResponse>> {
    return this.apiClient.post('/auth/github', { code });
  }

  async telegramAuth(data: TelegramAuthRequest): Promise<ApiResponse<TelegramAuthResponse>> {
    return this.apiClient.post('/auth/telegram', data);
  }

  async logout(): Promise<void> {
    this.apiClient.removeAuthToken();
  }

  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return this.apiClient.post('/auth/refresh');
  }
}