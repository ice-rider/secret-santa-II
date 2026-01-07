import React, { createContext, useContext, useState } from 'react';
import { ApiClient } from '../lib/api/client';
import { AuthService } from '../lib/api/auth';

interface ApiContextType {
  apiClient: ApiClient;
  authService: AuthService;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [apiClient] = useState(() => {
    const client = new ApiClient({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
      timeout: 10000,
    });
    return client;
  });

  const [authService] = useState(() => new AuthService(apiClient));

  return (
    <ApiContext.Provider value={{ apiClient, authService }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiClient = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiClient must be used within an ApiProvider');
  }
  return context;
};