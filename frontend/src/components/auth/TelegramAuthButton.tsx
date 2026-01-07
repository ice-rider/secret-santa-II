import React, { useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { useApiClient } from '../../contexts/ApiContext';
import TelegramIcon from './TelegramIcon';

interface TelegramAuthButtonProps {
  onAuthSuccess?: () => void;
  onError?: (error: string) => void;
}

const TelegramAuthButton: React.FC<TelegramAuthButtonProps> = ({ onAuthSuccess, onError }) => {
  const { authService } = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTelegramAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      // For mock implementation, we'll simulate a successful Telegram login
      // In a real app, you would follow the actual Telegram auth flow
      const mockToken = 'mock-jwt-token-for-testing';

      // Store the token in the API client
      authService.getApiClient().setAuthToken(mockToken);

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Telegram Auth error:', err);
      setError(err.message || 'An error occurred during Telegram authentication');
      if (onError) {
        onError(err.message || 'An error occurred during Telegram authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-login if we're in Telegram Web App and user hasn't interacted yet
  React.useEffect(() => {
    // Check if we're in a Telegram Web App environment
    if (typeof (window as any).Telegram !== 'undefined' && (window as any).Telegram.WebApp) {
      const webApp = (window as any).Telegram.WebApp;

      // If initData exists, we can auto-authenticate
      if (webApp.initData || webApp.initDataUnsafe) {
        // Only auto-login if this is the first render and user hasn't interacted
        // In a real app, you might want to check if the user is already authenticated
        // and if not, auto-login with Telegram data
        console.log('User came from Telegram, auto-authentication available');
      }
    }
  }, []);

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      {error && (
        <div style={{ color: 'red', fontSize: '0.75rem', marginBottom: '8px' }}>
          {error}
        </div>
      )}
      
      <Button
        variant="outlined"
        fullWidth
        startIcon={loading ? <CircularProgress size={20} /> : <TelegramIcon />}
        onClick={handleTelegramAuth}
        disabled={loading}
        sx={{ 
          borderColor: '#0088cc',
          color: '#0088cc',
          '&:hover': {
            borderColor: '#006699',
            backgroundColor: 'rgba(0, 136, 204, 0.04)',
          }
        }}
      >
        {loading ? 'Signing in...' : 'Continue with Telegram'}
      </Button>
    </Box>
  );
};

export default TelegramAuthButton;