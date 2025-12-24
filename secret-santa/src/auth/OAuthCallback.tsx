import { onMount } from 'solid-js';

const OAuthCallback = () => {
  onMount(() => {
    // Extract tokens from URL hash or query parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search.substring(1));

    // Try to get tokens from either hash or query params
    const accessToken = hashParams.get('accessToken') || queryParams.get('accessToken');
    const refreshToken = hashParams.get('refreshToken') || queryParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update auth state in opener window if this is a popup
      if (window.opener && window.opener !== window) {
        // Update the opener's auth state
        try {
          window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            accessToken,
            refreshToken
          }, window.location.origin);
        } catch (e) {
          console.error('Error sending message to opener:', e);
        }

        // Close the popup
        window.close();
      } else {
        // If not a popup, redirect to home page
        window.location.href = '/';
      }
    } else {
      // Handle error case
      console.error('OAuth callback missing tokens');

      if (window.opener && window.opener !== window) {
        // Notify opener of failure
        try {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: 'Missing tokens in OAuth callback'
          }, window.location.origin);
        } catch (e) {
          console.error('Error sending error message to opener:', e);
        }

        // Close the popup
        window.close();
      } else {
        // If not a popup, redirect to login
        window.location.href = '/login';
      }
    }
  });

  return (
    <div class="oauth-callback">
      <p>Processing authentication...</p>
    </div>
  );
};

export default OAuthCallback;