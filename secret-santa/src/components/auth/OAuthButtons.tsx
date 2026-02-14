// frontend/src/components/auth/OAuthButtons.tsx
import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/auth/AuthContext';

interface OAuthButtonsProps {
  onAuthSuccess?: () => void;
  onError?: (error: string) => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onAuthSuccess, onError }) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    google: false,
    github: false,
  });
  const [error, setError] = useState<string | null>(null);
  const { forceRefreshAuth } = useAuth();

  // Check for OAuth callback parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const oauthError = urlParams.get('oauth_error');
    const oauthErrorMessage = urlParams.get('error_message');

    if (oauthSuccess === 'true') {
      console.log('OAuth success detected from URL parameters');
      forceRefreshAuth().then(() => {
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      }).catch((error) => {
        console.error('Error during force refresh:', error);
        if (onError) {
          onError('Authentication failed to complete properly');
        }
      });
    } else if (oauthError === 'true') {
      const errorMsg = oauthErrorMessage || 'OAuth authentication failed';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }

    // Clear the URL parameters after processing to prevent repeated execution
    if (oauthSuccess || oauthError) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onAuthSuccess, onError, forceRefreshAuth]);

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setLoading((prev) => ({ ...prev, [provider]: true }));
    setError(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const oauthUrl = `${apiBaseUrl}/oauth/${provider}`;

    // Instead of opening a popup, redirect to the OAuth provider
    // The OAuth provider will redirect back to our callback URL
    window.location.href = oauthUrl;
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" align="center" sx={{ mb: 1, color: 'text.secondary' }}>
        Or continue with
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={() => handleOAuthLogin('google')}
          disabled={loading.google}
          sx={{ flex: 1 }}
        >
          {loading.google ? <CircularProgress size={20} /> : 'Google'}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<GitHubIcon />}
          onClick={() => handleOAuthLogin('github')}
          disabled={loading.github}
          sx={{ flex: 1 }}
        >
          {loading.github ? <CircularProgress size={20} /> : 'GitHub'}
        </Button>
      </Box>
    </Box>
  );
};

export default OAuthButtons;