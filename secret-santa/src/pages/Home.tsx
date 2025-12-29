import { createSignal, onMount } from 'solid-js';
import { useAuth } from '../AuthProvider';
import { Button } from '../components/ui/Button';
import { A } from '@solidjs/router';
import { Typography, Grid, Stack } from '@suid/material';

const HomePage = () => {
  const auth = useAuth();
  const [greeting, setGreeting] = createSignal('Welcome!');

  onMount(() => {
    if (auth.isAuthenticated && auth.user) {
      setGreeting(`Welcome back, ${auth.user.name || auth.user.email}!`);
    }
  });

  if (auth.isLoading) {
    return (
      <div style={{ display: 'flex', 'justify-content': 'center', 'align-items': 'center', height: '100vh' }}>
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div style={{
      'min-height': '100vh',
      'background': 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        'justify-content': 'space-between', 
        'align-items': 'center', 
        padding: '24px'
      }}>
        <Typography variant="h4" component="h1" style={{
          'background': 'linear-gradient(to right, #3b82f6, #a855f7)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          color: 'transparent',
          'font-weight': 'bold'
        }}>
          Secret Santa
        </Typography>
        <nav>
          <Stack direction="row" spacing={2} alignItems="center">
            {auth.isAuthenticated ? (
              <>
                <A href="/dashboard" style={{ color: 'inherit', 'text-decoration': 'none' }}>
                  Dashboard
                </A>
                <A href="/profile" style={{ color: 'inherit', 'text-decoration': 'none' }}>
                  Profile
                </A>
                <Button onClick={auth.logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <A href="/login" style={{ color: 'inherit', 'text-decoration': 'none' }}>
                  Login
                </A>
                <A href="/register" style={{ color: 'inherit', 'text-decoration': 'none' }}>
                  <Button>Get Started</Button>
                </A>
              </>
            )}
          </Stack>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div style={{ 'padding': '64px 24px', 'max-width': '1200px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', 'margin-bottom': '24px', 'border-radius': '50px', 'background': 'linear-gradient(to right, #3b82f6, #a855f7)' }}>
            <div style={{
              'background': 'white',
              'border-radius': '50px',
              'padding': '8px 16px'
            }}>
              <Typography variant="body2" style={{ 'font-weight': 'medium' }}>
                The festive way to exchange gifts
              </Typography>
            </div>
          </div>

          <Typography variant="h2" style={{ 'margin-bottom': '24px', 'color': '#1f2937', 'font-weight': 'bold' }}>
            {greeting()}
          </Typography>

          <Typography variant="h6" color="textSecondary" style={{ 'margin-bottom': '40px', 'max-width': '600px' }}>
            Join or create a Secret Santa event with friends and family! Let the magic of surprise gifts bring joy to your celebrations.
          </Typography>

          <Stack direction="row" spacing={2} style={{ 'margin-bottom': '160px' }}>
            {auth.isAuthenticated ? (
              <A href="/dashboard">
                <Button size="large">
                  Go to Dashboard
                </Button>
              </A>
            ) : (
              <A href="/register">
                <Button size="large">
                  Get Started
                </Button>
              </A>
            )}

            <Button variant="outlined" size="large">
              How it works
            </Button>
          </Stack>

          {/* Features Section */}
          <div style={{ 'margin-top': '96px', 'max-width': '1200px' }}>
            <Grid container spacing={8}>
              <div style={{ 'padding': '0 8px' }}>
                <div style={{
                  'background-color': 'white',
                  'border-radius': '8px',
                  'border': '1px solid #e5e7eb',
                  'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  'padding': '24px',
                  'transition': 'box-shadow 0.3s',
                  'margin-bottom': '24px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    'border-radius': '50%',
                    'background-color': 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'margin-bottom': '16px'
                  }}>
                    <Typography style={{ 'font-size': '1.5rem' }}>🎁</Typography>
                  </div>
                  <Typography variant="h6" style={{ 'margin-bottom': '8px' }}>Easy Setup</Typography>
                  <Typography color="textSecondary">
                    Create your Secret Santa event in minutes. Invite participants via email or share a link.
                  </Typography>
                </div>
              </div>

              <div style={{ 'padding': '0 8px' }}>
                <div style={{
                  'background-color': 'white',
                  'border-radius': '8px',
                  'border': '1px solid #e5e7eb',
                  'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  'padding': '24px',
                  'transition': 'box-shadow 0.3s',
                  'margin-bottom': '24px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    'border-radius': '50%',
                    'background-color': 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'margin-bottom': '16px'
                  }}>
                    <Typography style={{ 'font-size': '1.5rem' }}>✨</Typography>
                  </div>
                  <Typography variant="h6" style={{ 'margin-bottom': '8px' }}>Automatic Matching</Typography>
                  <Typography color="textSecondary">
                    Our algorithm ensures fair and random assignment of Secret Santas with no repeats.
                  </Typography>
                </div>
              </div>

              <div style={{ 'padding': '0 8px' }}>
                <div style={{
                  'background-color': 'white',
                  'border-radius': '8px',
                  'border': '1px solid #e5e7eb',
                  'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  'padding': '24px',
                  'transition': 'box-shadow 0.3s'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    'border-radius': '50%',
                    'background-color': 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'margin-bottom': '16px'
                  }}>
                    <Typography style={{ 'font-size': '1.5rem' }}>🔔</Typography>
                  </div>
                  <Typography variant="h6" style={{ 'margin-bottom': '8px' }}>Notifications</Typography>
                  <Typography color="textSecondary">
                    Get timely reminders about your assigned person and important event dates.
                  </Typography>
                </div>
              </div>
            </Grid>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;