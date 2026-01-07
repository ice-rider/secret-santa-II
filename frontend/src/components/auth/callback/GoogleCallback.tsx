import React, { useEffect } from 'react';

const GoogleCallback: React.FC = () => {
  useEffect(() => {
    // Extract the authorization code from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    // Check if this is running in a popup window
    const isPopup = window.opener && window.opener !== window;
    
    if (error) {
      // Send error message to the parent window
      if (isPopup && window.opener) {
        window.opener.postMessage({
          type: 'oauth_error',
          message: `Google OAuth error: ${error}`
        }, window.location.origin);
        
        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        console.error('Google OAuth error:', error);
      }
      return;
    }
    
    if (code) {
      // Send success message with the authorization code to the parent window
      if (isPopup && window.opener) {
        window.opener.postMessage({
          type: 'oauth_success',
          provider: 'google',
          code: code
        }, window.location.origin);
        
        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        console.log('Received Google OAuth code:', code);
        // In a non-popup context, we might redirect or handle differently
      }
    } else {
      // No code or error in the URL - this shouldn't happen in a proper OAuth flow
      if (isPopup && window.opener) {
        window.opener.postMessage({
          type: 'oauth_error',
          message: 'No authorization code received from Google'
        }, window.location.origin);
        
        setTimeout(() => {
          window.close();
        }, 1500);
      }
    }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h2>Processing Google Authentication...</h2>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;