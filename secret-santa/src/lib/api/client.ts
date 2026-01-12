// frontend/src/lib/api/client.ts
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
  private axiosInstance: any;
  private config: ApiConfig;
  private isRefreshing = false;
  private failedQueue: Array<{resolve: (value: any) => void, reject: (value: any) => void}> = [];

  constructor(_config: ApiConfig) {
    this.config = _config;
    this.axiosInstance = axios.create({
      baseURL: _config.baseURL,
      timeout: _config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ..._config.headers,
      },
      withCredentials: true, // Important for cookie-based auth
    });

    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  private handleRequest(_config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Get access token from localStorage or sessionStorage
    const accessToken = localStorage.getItem('accessToken');

    // Don't add authorization header to public endpoints
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/oauth/', '/auth/callback'];
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      _config.url?.includes(endpoint)
    );

    if (accessToken && !isPublicEndpoint) {
      _config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return _config;
  }

  private handleRequestError(error: any): Promise<any> {
    return Promise.reject(error);
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    // Check if the response contains tokens to store
    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  }

  private async handleResponseError(error: any): Promise<any> {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          return this.axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        // The refresh endpoint will use the refresh token from cookies
        const response = await this.axiosInstance.post('/auth/refresh', {});

        if (response.status === 200 && response.data && response.data.accessToken) {
          // Store the new access token
          localStorage.setItem('accessToken', response.data.accessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          this.processQueue(null);
          return this.axiosInstance(originalRequest);
        } else {
          this.processQueue(response.data, null);
          this.handleUnauthorized();
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
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

  private handleUnauthorized(): void {
    // Redirect to login
    window.location.href = '/login';
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
}