// frontend/src/hooks/useSignalR.ts
import { useEffect, useRef, useState } from 'react';
import { SignalRService, GameStatusEvent, UserEvent } from '../services/SignalRService';
import { useAuth } from '../contexts/auth/AuthContext';

interface UseSignalROptions {
  gameId?: number;
  onGameStatusUpdate?: (event: GameStatusEvent) => void;
  onUserJoin?: (event: UserEvent) => void;
  onUserExit?: (event: UserEvent) => void;
}

export const useSignalR = (options: UseSignalROptions) => {
  const { gameId, onGameStatusUpdate, onUserJoin, onUserExit } = options;
  const { user } = useAuth(); // Получаем данные пользователя для проверки аутентификации
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const signalRServiceRef = useRef<SignalRService | null>(null);

  useEffect(() => {
    const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL;
    if (!hubUrl) {
      setError(new Error('SignalR Hub URL not configured'));
      return;
    }

    const service = new SignalRService(hubUrl);
    signalRServiceRef.current = service;

    const connect = async () => {
      try {
        // Get access token from localStorage to pass to SignalR connection
        const accessToken = localStorage.getItem('accessToken');
        await service.connect(accessToken || undefined);
        setIsConnected(true);
        setError(null);

        if (gameId) {
          await service.joinGame(gameId);
        }
      } catch (err) {
        setError(err as Error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      service.disconnect();
      setIsConnected(false);
    };
  }, [gameId, user]); // Добавляем user в зависимости, чтобы переподключаться при изменении состояния аутентификации

  useEffect(() => {
    const service = signalRServiceRef.current;
    if (!service || !isConnected) return;

    if (onGameStatusUpdate) {
      service.onGameStatusUpdate(onGameStatusUpdate);
    }

    if (onUserJoin) {
      service.onUserJoin(onUserJoin);
    }

    if (onUserExit) {
      service.onUserExit(onUserExit);
    }

    return () => {
      if (onGameStatusUpdate) {
        service.offGameStatusUpdate(onGameStatusUpdate);
      }
      if (onUserJoin) {
        service.offUserJoin(onUserJoin);
      }
      if (onUserExit) {
        service.offUserExit(onUserExit);
      }
    };
  }, [isConnected, onGameStatusUpdate, onUserJoin, onUserExit]);

  return {
    isConnected,
    error,
    signalRService: signalRServiceRef.current,
  };
};