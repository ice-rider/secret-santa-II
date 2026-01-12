// frontend/src/contexts/ApiContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { ApiClient } from '../lib/api/client';
import { AuthService } from '../lib/api/auth';
import { GameService } from '../lib/api/game';

interface ApiContextType {
  apiClient: ApiClient;
  authService: AuthService;
  gameService: GameService;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiClient = useMemo(() => {
    let apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      apiUrl = '/api';
      console.warning("FRONTEND MISSED ENV VAR 'VITE_API_BASE_URL' CHECK YOUR ENVIRONMENT. (use '/api' as base url)")
    }
    return new ApiClient({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  const authService = useMemo(() => new AuthService(apiClient), [apiClient]);
  const gameService = useMemo(() => new GameService(apiClient), [apiClient]);

  return (
    <ApiContext.Provider value={{ apiClient, authService, gameService }}>
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
