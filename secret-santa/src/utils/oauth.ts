// OAuth utility functions

// Open OAuth popup window
export const openOAuthPopup = (url: string, provider: string) => {
  // Calculate popup window position and size
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  // Open the popup window
  const popup = window.open(
    url,
    `${provider}_oauth`,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  if (!popup) {
    throw new Error('Failed to open authentication popup. Please check your popup blocker.');
  }

  // Focus the popup
  popup.focus();

  return popup;
};

// Check if OAuth popup is closed
export const isPopupClosed = (popup: Window | null): boolean => {
  return !popup || popup.closed;
};

// Listen for OAuth success messages
export const listenForOAuthSuccess = (
  callback: (data: { accessToken: string; refreshToken: string }) => void,
  errorCallback?: (error: string) => void
) => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'OAUTH_SUCCESS') {
      callback({
        accessToken: event.data.accessToken,
        refreshToken: event.data.refreshToken
      });
    } else if (event.data.type === 'OAUTH_ERROR') {
      if (errorCallback) {
        errorCallback(event.data.error || 'OAuth authentication failed');
      }
    }
  };

  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};