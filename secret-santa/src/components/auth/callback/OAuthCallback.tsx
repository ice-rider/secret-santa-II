// frontend/src/components/auth/callback/OAuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth/AuthContext';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshToken } = useAuth(); // Используем refreshToken для проверки аутентификации
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log all search parameters for debugging
    console.log('OAuthCallback search parameters:', Object.fromEntries(searchParams.entries()));

    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      const errorMsg = errorDescription || `OAuth error: ${errorParam}`;
      setError(errorMsg);

      // Send error message to parent window if this is in a popup
      if (window.opener && window.opener !== window) {
        window.opener.postMessage(
          {
            type: 'oauth_error',
            message: errorMsg,
          },
          '*'
        );

        // Redirect back to login page with success indicator in URL
        setTimeout(() => {
          // Add success parameter to the URL to indicate successful authentication
          window.location.href = `/login?oauth_success=true`;
        }, 1000); // Shorter delay for redirect
      } else {
        // Not in popup, redirect to login with error
        setTimeout(() => {
          navigate('/login?oauth_error=true&error_message=' + encodeURIComponent(errorMsg));
        }, 3000);
      }
    } else {
      // Successful auth - try to get user ID from URL params or refresh token
      const userId = searchParams.get('id') || searchParams.get('userId') || searchParams.get('user_id');
      console.log('Extracted userId from URL:', userId);

      // Refresh token to load user data (tokens should be already stored)
      refreshToken()
        .then(() => {
          console.log('Successfully refreshed token after OAuth');
          // Send success message to parent window if this is in a popup
          if (window.opener && window.opener !== window) {
            window.opener.postMessage(
              {
                type: 'oauth_success',
                userId: userId || 'unknown', // Pass userId if available, otherwise 'unknown'
              },
              window.location.origin // More secure than using '*'
            );

            // Redirect back to login page with success indicator in URL
            setTimeout(() => {
              // Add success parameter to the URL to indicate successful authentication
              window.location.href = `/login?oauth_success=true`;
            }, 1000); // Delay to ensure token refresh completes
          } else {
            // Not in popup, redirect to home or games page
            navigate('/games');
          }
        })
        .catch((err: any) => {
          setError('Failed to load user after authentication');
          console.error('Error loading user:', err);

          if (window.opener && window.opener !== window) {
            window.opener.postMessage(
              {
                type: 'oauth_error',
                message: 'Failed to load user after authentication',
              },
              window.location.origin
            );

            // Redirect back to login page with error indicator in URL
            setTimeout(() => {
              window.location.href = `/login?oauth_error=true&error_message=Failed to load user after authentication`;
            }, 1000); // Shorter delay for redirect
          } else {
            setTimeout(() => {
              navigate('/login?oauth_error=true&error_message=token_refresh_failed');
            }, 3000);
          }
        });
    }
  }, [searchParams, navigate, refreshToken]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      {error ? (
        <>
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            You may close this window manually.
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress size={48} />
          <Typography variant="h6">Processing Authentication...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we complete the authentication process.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You may close this window manually if it doesn't close automatically.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OAuthCallback;