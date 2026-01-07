import React, { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useApiClient } from '../../contexts/ApiContext';
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import TelegramAuthButton from './TelegramAuthButton';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';

interface OAuthButtonsProps {
  onAuthSuccess?: () => void;
  onError?: (error: string) => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onAuthSuccess, onError }) => {
  const { authService } = useApiClient();
  const { isTelegram, telegramUser } = useTelegramWebApp();
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    google: false,
    github: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(prev => ({ ...prev, google: true }));
    setError(null);

    try {
      // For mock implementation, we'll simulate a successful OAuth login
      // In a real app, you would follow the actual OAuth flow
      const mockToken = 'mock-jwt-token-for-testing';

      // Store the token in the API client
      authService.getApiClient().setAuthToken(mockToken);

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'An error occurred during Google authentication');
      if (onError) {
        onError(err.message || 'An error occurred during Google authentication');
      }
    } finally {
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleGitHubAuth = async () => {
    setLoading(prev => ({ ...prev, github: true }));
    setError(null);

    try {
      // For mock implementation, we'll simulate a successful OAuth login
      // In a real app, you would follow the actual OAuth flow
      const mockToken = 'mock-jwt-token-for-testing';

      // Store the token in the API client
      authService.getApiClient().setAuthToken(mockToken);

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('GitHub OAuth error:', err);
      setError(err.message || 'An error occurred during GitHub authentication');
      if (onError) {
        onError(err.message || 'An error occurred during GitHub authentication');
      }
    } finally {
      setLoading(prev => ({ ...prev, github: false }));
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="body2" align="center" sx={{ mb: 1, color: 'text.secondary' }}>
        Or sign in with
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {isTelegram && (
          <Box sx={{ mb: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
              Welcome from Telegram! ({telegramUser?.first_name})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              You can use Telegram to sign in or choose another method below
            </Typography>
          </Box>
        )}

        <TelegramAuthButton
          onAuthSuccess={onAuthSuccess}
          onError={onError}
        />

        <Typography variant="body2" align="center" sx={{ my: 1, color: 'text.secondary' }}>
          Or sign in with
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          startIcon={loading.google ? <CircularProgress size={20} /> : <GoogleIcon />}
          onClick={handleGoogleAuth}
          disabled={loading.google}
          sx={{
            borderColor: 'grey.300',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'grey.400',
            }
          }}
        >
          {loading.google ? 'Signing in...' : 'Continue with Google'}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={loading.github ? <CircularProgress size={20} /> : <GitHubIcon />}
          onClick={handleGitHubAuth}
          disabled={loading.github}
          sx={{
            borderColor: 'grey.300',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'grey.400',
            }
          }}
        >
          {loading.github ? 'Signing in...' : 'Continue with GitHub'}
        </Button>
      </Box>
    </Box>
  );
};

export default OAuthButtons;