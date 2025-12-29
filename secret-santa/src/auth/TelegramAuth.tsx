import { createSignal, onMount } from 'solid-js';
import type { TelegramAuthData } from '../types';
import authStore from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import { Box, Typography } from '@suid/material';

interface TelegramAuthProps {
  onAuthSuccess?: () => void;
  botName?: string; // Telegram bot name if needed
}

const TelegramAuth = (props: TelegramAuthProps) => {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  // Function to initialize Telegram Web App authentication
  const initTelegramAuth = () => {
    // Check if we're in a Telegram Web App environment
    if ((window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;

      // Ready the WebApp
      webApp.ready();

      return {
        init: () => {
          // Telegram Web App auth is ready
          return webApp;
        },
        getUser: () => webApp.initDataUnsafe?.user || null,
        getAuthData: () => webApp.initDataUnsafe || null
      };
    }

    // If not in Telegram Web App, we'll use the login widget
    return null;
  };

  const handleTelegramAuth = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if we're in a Telegram Web App
      const tg = initTelegramAuth();

      if (tg) {
        // We're in Telegram Web App environment
        const user = tg.getUser();
        const authData = tg.getAuthData();

        if (!user || !authData) {
          throw new Error('Could not retrieve user data from Telegram');
        }

        // Prepare auth data for backend
        const telegramAuthData: TelegramAuthData = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: authData.auth_date,
          hash: authData.hash
        };

        // Call auth store to authenticate with Telegram
        const result = await authStore.telegramLogin(telegramAuthData);

        if (!result.success) {
          throw new Error(result.error || 'Telegram authentication failed');
        }

        // Call success callback if provided
        if (props.onAuthSuccess) {
          props.onAuthSuccess();
        }
      } else {
        // Not in Telegram Web App - redirect to Telegram auth page or use widget
        // For now, we'll just show an error message
        throw new Error('Please open this page in the Telegram app to continue with Telegram authentication');
      }
    } catch (err: any) {
      setError(err.message || 'Telegram authentication failed');
      console.error('Telegram auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Telegram Web App if available
  onMount(() => {
    // Check if Telegram Web App script is loaded
    if (!(window as any).Telegram?.WebApp) {
      // If we need to load the Telegram script dynamically, we could do it here
      // For now, we'll just rely on it being included in the HTML
    }
  });

  return (
    <Box>
      {error() && (
        <Typography color="error" textAlign="center" mb={1}>
          {error()}
        </Typography>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleTelegramAuth}
        disabled={loading()}
        startIcon={
          loading() ? null : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 0C5.373 0 0 5.373 0 12S5.373 24 12 24s12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-1.206 6.076-1.495 7.716-.176 1.001-.431 1.358-.841 1.616-.383.242-1.302.303-2.109.218-1.788-.188-2.397-.35-3.811-.958-1.215-.526-1.957-1.002-2.811-1.856-.712-.71-.303-1.06.217-1.58.477-.478.791-.785 1.27-1.26 1.496-1.49.498-.812 2.015-1.415.507-.2.912-.21 1.35-.08.175.051.498.15.727.227.29.1.507.175.502.27-.005.095-.184.269-.353.428-.199.19-.343.325-.453.445-.12.126-.226.252-.352.412-.12.15-.274.31-.419.48-.415.485-.656.77-1.059 1.09-.28.22-.492.31-.672.34-.28.05-.676.03-1.13-.19-.616-.3-1.016-.71-1.445-1.15-.626-.64-1.096-1.45-1.55-2.24-.546-.95-.334-1.34.184-1.53.05-.02.352-.16.74-.32 3.46-1.41 4.96-2.02 6.86-2.57.92-.27 1.73-.33 2.04-.18.17.08.35.28.48.57.13.3.11.56-.05.85-.15.28-.38.51-.68.7-.29.18-.61.31-.95.4-.35.09-.68.13-1.01.13-.32 0-.72-.04-1.19-.16-.47-.13-.83-.21-1.08-.24-.25-.03-.55-.02-.89.03-.34.05-.67.14-1.01.27-.33.12-.64.3-.92.53-.29.23-.53.52-.72.86-.19.34-.31.73-.36 1.17-.05.44.01.92.19 1.44.18.52.48.99.9 1.41.42.42.94.73 1.55.94.61.21 1.31.31 2.1.31.79 0 1.69-.12 2.69-.37 1.01-.25 1.87-.49 2.59-.72.72-.23 1.35-.43 1.88-.6.53-.17 1.03-.32 1.49-.44.46-.12.83-.21 1.11-.27.28-.06.52-.11.71-.15.19-.04.36-.08.51-.12.15-.04.28-.09.39-.15.11-.06.2-.13.26-.21.06-.08.1-.17.12-.27.02-.1.01-.21-.03-.33-.04-.12-.11-.24-.21-.36-.1-.12-.23-.23-.39-.33-.16-.1-.35-.18-.57-.24-.22-.06-.47-.1-.75-.12-.28-.02-.59-.02-.93.01z" fill="#0088CC"/>
            </svg>
          )
        }
        fullWidth
      >
        {loading() ? 'Authenticating...' : 'Continue with Telegram'}
      </Button>
    </Box>
  );
};

export default TelegramAuth;