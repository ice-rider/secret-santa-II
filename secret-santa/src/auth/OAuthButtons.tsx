import { createSignal, onMount } from 'solid-js';
import authService from '../services/auth.service';
import authStore from '../stores/auth.store';

interface OAuthButtonsProps {
  onOAuthSuccess?: () => void;
}

const OAuthButtons = (props: OAuthButtonsProps) => {
  const [googleLoading, setGoogleLoading] = createSignal(false);
  const [githubLoading, setGithubLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const authUrl = await authService.googleAuthUrl();
      
      // Open OAuth popup
      openOAuthPopup(authUrl, 'google');
    } catch (err) {
      setError('Failed to initiate Google authentication');
      console.error('Google auth error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setGithubLoading(true);
    setError('');
    
    try {
      const authUrl = await authService.githubAuthUrl();
      
      // Open OAuth popup
      openOAuthPopup(authUrl, 'github');
    } catch (err) {
      setError('Failed to initiate GitHub authentication');
      console.error('GitHub auth error:', err);
    } finally {
      setGithubLoading(false);
    }
  };

  // Listen for messages from the popup
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'OAUTH_SUCCESS') {
      // Store tokens
      localStorage.setItem('accessToken', event.data.accessToken);
      localStorage.setItem('refreshToken', event.data.refreshToken);

      // Update auth state
      authStore.initializeAuth();

      // Call success callback
      if (props.onOAuthSuccess) {
        props.onOAuthSuccess();
      }
    } else if (event.data.type === 'OAUTH_ERROR') {
      setError(event.data.error || 'OAuth authentication failed');
    }
  };

  onMount(() => {
    window.addEventListener('message', handleMessage);
  });

  const openOAuthPopup = (url: string, provider: string) => {
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
      setError('Failed to open authentication popup. Please check your popup blocker.');
      return;
    }

    // Focus the popup
    popup.focus();

    // Monitor the popup for closure or redirect
    const popupCheck = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupCheck);
        // Optionally trigger a check for auth status when popup closes
        if (props.onOAuthSuccess) {
          props.onOAuthSuccess();
        }
      }
    }, 1000);
  };

  return (
    <div class="oauth-buttons">
      {error() && (
        <div class="error-message">
          {error()}
        </div>
      )}
      
      <button
        onClick={handleGoogleAuth}
        disabled={googleLoading()}
        class="oauth-button google"
      >
        {googleLoading() ? 'Loading...' : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.64 12 18.64C9.14 18.64 6.71 16.69 5.84 14.09H2.18V16.96C4 20.53 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.04H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.96L5.84 14.09Z" fill="#FBBC05"/>
              <path d="M12 5.36C13.62 5.36 15.06 5.93 16.21 7.04L19.36 4.05C17.45 2.24 14.97 1 12 1C7.7 1 4 3.47 2.18 7.04L5.84 9.91C6.71 7.31 9.14 5.36 12 5.36Z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>
      
      <button
        onClick={handleGitHubAuth}
        disabled={githubLoading()}
        class="oauth-button github"
      >
        {githubLoading() ? 'Loading...' : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 0.297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
            </svg>
            <span>Continue with GitHub</span>
          </>
        )}
      </button>
    </div>
  );
};

export default OAuthButtons;