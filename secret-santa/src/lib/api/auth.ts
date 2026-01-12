// frontend/src/lib/api/auth.ts
import { ApiClient } from './client';
import type { ApiResponse } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userProfile: UserProfile;
}

export class AuthService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.apiClient.post<LoginResponse>('/auth/login', request);

    // Store tokens in localStorage
    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response;
  }

  async register(request: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.apiClient.post<LoginResponse>('/auth/register', request);

    // Store tokens in localStorage
    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<boolean>> {
    // Clear stored tokens
    localStorage.removeItem('accessToken');
    return this.apiClient.post<boolean>('/auth/logout', {});
  }

  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const response = await this.apiClient.post<LoginResponse>('/auth/refresh', {});

    // Store the new access token
    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response;
  }
}