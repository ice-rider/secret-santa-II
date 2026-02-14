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
  const [loadingMessage, setLoadingMessage] = useState('Processing Authentication...');

  useEffect(() => {
    console.log('OAuthCallback mounted');
    console.log('OAuthCallback search parameters:', Object.fromEntries(searchParams.entries()));

    // Проверяем, есть ли refreshToken функция
    console.log('refreshToken function exists:', typeof refreshToken === 'function');

    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      const errorMsg = errorDescription || `OAuth error: ${errorParam}`;
      setError(errorMsg);
      console.log('OAuth error detected:', errorMsg);

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

      // Small delay to ensure cookies are properly set after OAuth redirect
      const attemptRefresh = async (retries = 3, delay = 1000) => {
        setLoadingMessage('Verifying authentication...');
        console.log('Starting refresh token attempts...');
        
        for (let i = 0; i < retries; i++) {
          console.log(`Attempt ${i + 1} to refresh token after OAuth`);
          
          try {
            // Проверяем, что refreshToken функция существует
            if (typeof refreshToken !== 'function') {
              throw new Error('refreshToken is not a function');
            }
            
            console.log('Calling refreshToken()...');
            
            // Refresh token to load user data (tokens should be already stored in cookies)
            const result = await refreshToken();
            console.log('Refresh token result:', result);
            
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
              console.log('Navigating to /games');
              navigate('/games');
            }
            return; // Success, exit the retry loop
          } catch (err: any) {
            console.error(`Token refresh attempt ${i + 1} failed:`, err);
            console.error('Error details:', err?.response?.data || err?.message || err);
            
            if (i < retries - 1) {
              // Wait before next retry
              console.log(`Waiting ${delay}ms before next retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              setLoadingMessage(`Retrying authentication... (${i + 2}/${retries})`);
            } else {
              // All retries failed
              console.error('All refresh attempts failed');
              setError('Failed to authenticate after OAuth. Please try logging in again.');
              console.error('Error loading user after OAuth:', err);

              if (window.opener && window.opener !== window) {
                window.opener.postMessage(
                  {
                    type: 'oauth_error',
                    message: 'Failed to authenticate after OAuth',
                  },
                  window.location.origin
                );

                // Redirect back to login page with error indicator in URL
                setTimeout(() => {
                  window.location.href = `/login?oauth_error=true&error_message=Failed to authenticate after OAuth`;
                }, 1000); // Shorter delay for redirect
              } else {
                setTimeout(() => {
                  navigate('/login?oauth_error=true&error_message=token_refresh_failed');
                }, 3000);
              }
            }
          }
        }
      };

      // Start the refresh attempt process
      console.log('About to start refresh token attempts...');
      attemptRefresh();
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
          <Typography variant="h6">{loadingMessage}</Typography>
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