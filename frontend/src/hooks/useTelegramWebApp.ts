import { useEffect, useState } from 'react';

interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export const useTelegramWebApp = () => {
  const [isTelegram, setIsTelegram] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're in a Telegram Web App environment
    if (typeof (window as any).Telegram !== 'undefined' && (window as any).Telegram.WebApp) {
      const webApp = (window as any).Telegram.WebApp;
      
      // Initialize the Telegram Web App
      webApp.ready();
      
      // Get the authentication data
      const authData = webApp.initData || webApp.initDataUnsafe;
      
      if (authData) {
        // Parse the authentication data
        const authParams = new URLSearchParams(authData);
        const user: TelegramUser = {
          id: authParams.get('id') || '',
          first_name: authParams.get('first_name') || '',
          last_name: authParams.get('last_name') || '',
          username: authParams.get('username') || '',
          photo_url: authParams.get('photo_url') || '',
          auth_date: parseInt(authParams.get('auth_date') || '0'),
          hash: authParams.get('hash') || ''
        };

        // Verify that we have the required fields
        if (user.id && user.hash) {
          setIsTelegram(true);
          setTelegramUser(user);
        }
      }
    }
    
    setIsReady(true);
  }, []);

  return { isTelegram, telegramUser, isReady };
};