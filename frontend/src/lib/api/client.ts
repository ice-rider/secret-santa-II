import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export class ApiClient {
  private axiosInstance: any; // Using any to allow for axios instance with interceptors
  private config: ApiConfig;
  private isRefreshing = false;
  private failedQueue: Array<{resolve: (value: any) => void, reject: (value: any) => void}> = [];

  constructor(_config: ApiConfig) {
    this.config = _config;
    this.axiosInstance = axios.create({
      baseURL: _config.baseURL,
      timeout: _config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ..._config.headers,
      },
    });

    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  private handleRequest(_config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add auth token if available
    const token = this.getToken();
    if (token && _config.headers) {
      _config.headers.Authorization = `Bearer ${token}`;
    }
    return _config;
  }

  private handleRequestError(error: any): Promise<any> {
    return Promise.reject(error);
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  private async handleResponseError(error: any): Promise<any> {
    const originalRequest = error.config;

    // Handle specific error cases
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        // If a token refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return this.axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.handleUnauthorized();
        return Promise.reject(error);
      }

      try {
        // Create a separate axios instance for refresh to avoid infinite loop
        const refreshTokenInstance = axios.create({
          baseURL: this.config.baseURL,
          timeout: this.config.timeout || 10000,
          headers: {
            'Content-Type': 'application/json',
            ...this.config.headers,
          },
        });

        // Attempt to refresh the token
        const response = await refreshTokenInstance.post('/auth/refresh', {
          refreshToken: refreshToken
        });

        if (response.status === 200) {
          const { token, refreshToken: newRefreshToken } = response.data;

          // Update tokens in storage
          this.setAuthToken(token);
          this.setRefreshToken(newRefreshToken);

          // Process the queue
          this.processQueue(null, token);

          // Retry the original request
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return this.axiosInstance(originalRequest);
        } else {
          // Refresh failed
          this.processQueue(response.data, null);
          this.handleUnauthorized();
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        // Token refresh failed
        this.processQueue(refreshError, null);
        this.handleUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private getToken(): string | null {
    // Get token from localStorage or other storage
    return localStorage.getItem('authToken');
  }

  private getRefreshToken(): string | null {
    // Get refresh token from localStorage or other storage
    return localStorage.getItem('refreshToken');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  private handleUnauthorized(): void {
    // Clear auth tokens and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    // Optionally redirect to login page
    // window.location.href = '/login';
  }

  public async get<T>(url: string, _config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get(url, _config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  public async post<T>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post(url, data, _config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  public async put<T>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put(url, data, _config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  public async delete<T>(url: string, _config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete(url, _config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  public async patch<T>(url: string, data?: any, _config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch(url, data, _config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  public getConfig(): ApiConfig {
    return this.config;
  }

  public setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  public removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}