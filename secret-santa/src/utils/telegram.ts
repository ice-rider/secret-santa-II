// Telegram utility functions

// Initialize Telegram Web App
export const initTelegramWebApp = () => {
  // Check if we're in a Telegram Web App environment
  if ((window as any).Telegram?.WebApp) {
    const webApp = (window as any).Telegram.WebApp;

    // Ready the WebApp
    webApp.ready();

    return {
      init: () => webApp,
      getUser: () => webApp.initDataUnsafe?.user || null,
      getAuthData: () => webApp.initDataUnsafe || null,
      close: () => webApp.close(),
      expand: () => webApp.expand(),
      ready: () => webApp.ready(),
      enableClosingConfirmation: (value: boolean) => webApp.enableClosingConfirmation(value),
    };
  }

  return null;
};

// Check if Telegram Web App is available
export const isTelegramWebApp = () => {
  return !!(window as any).Telegram?.WebApp;
};

// Get Telegram user data
export const getTelegramUser = () => {
  if (isTelegramWebApp()) {
    const webApp = (window as any).Telegram.WebApp;
    return webApp.initDataUnsafe?.user || null;
  }
  return null;
};

// Get Telegram auth data
export const getTelegramAuthData = () => {
  if (isTelegramWebApp()) {
    const webApp = (window as any).Telegram.WebApp;
    return webApp.initDataUnsafe || null;
  }
  return null;
};