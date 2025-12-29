import { createSignal, onMount } from 'solid-js';
import { useAuth } from '../AuthProvider';
import { Button } from '../components/ui/Button';
import { A } from '@solidjs/router';
import { Container, Typography, Grid, Box, Stack } from '@suid/material';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))'
    }}>
      {/* Header */}
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 6 }}>
        <Typography variant="h4" component="h1" sx={{
          background: 'linear-gradient(to right, #3b82f6, #a855f7)',
          backgroundClip: 'text',
          color: 'transparent',
          fontWeight: 'bold'
        }}>
          Secret Santa
        </Typography>
        <nav>
          <Stack direction="row" spacing={2} alignItems="center">
            {auth.isAuthenticated ? (
              <>
                <A href="/dashboard" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  Dashboard
                </A>
                <A href="/profile" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  Profile
                </A>
                <Button onClick={auth.logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <A href="/login" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  Login
                </A>
                <A href="/register" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  <Button>Get Started</Button>
                </A>
              </>
            )}
          </Stack>
        </nav>
      </Box>

      {/* Hero Section */}
      <main>
        <Container maxWidth="lg">
          <Box sx={{ py: 16, textAlign: 'center' }}>
            <Box sx={{ display: 'inline-block', mb: 6, borderRadius: 100, background: 'linear-gradient(to right, #3b82f6, #a855f7)' }}>
              <Box
                sx={{
                  background: 'white',
                  borderRadius: '50px',
                  px: 4,
                  py: 1
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  The festive way to exchange gifts
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h2"
              mb={6}
              sx={{
                background: 'linear-gradient(to right, #1f2937, #6b7280)',
                backgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold'
              }}
            >
              {greeting()}
            </Typography>

            <Typography variant="h6" color="textSecondary" mb={10} maxWidth="md" mx="auto">
              Join or create a Secret Santa event with friends and family! Let the magic of surprise gifts bring joy to your celebrations.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
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
          </Box>

          {/* Features Section */}
          <Box sx={{ mt: 24, maxWidth: 'xl', mx: 'auto' }}>
            <Grid container spacing={8}>
              <Grid item xs={12} md={4}>
                <Box sx={{
                  p: 6,
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  '&:hover': { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                  transition: 'box-shadow 0.3s'
                }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 4
                    }}
                  >
                    <Typography fontSize="1.5rem">🎁</Typography>
                  </Box>
                  <Typography variant="h6" mb={2}>Easy Setup</Typography>
                  <Typography color="textSecondary">
                    Create your Secret Santa event in minutes. Invite participants via email or share a link.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{
                  p: 6,
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  '&:hover': { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                  transition: 'box-shadow 0.3s'
                }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 4
                    }}
                  >
                    <Typography fontSize="1.5rem">✨</Typography>
                  </Box>
                  <Typography variant="h6" mb={2}>Automatic Matching</Typography>
                  <Typography color="textSecondary">
                    Our algorithm ensures fair and random assignment of Secret Santas with no repeats.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{
                  p: 6,
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  '&:hover': { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                  transition: 'box-shadow 0.3s'
                }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 4
                    }}
                  >
                    <Typography fontSize="1.5rem">🔔</Typography>
                  </Box>
                  <Typography variant="h6" mb={2}>Notifications</Typography>
                  <Typography color="textSecondary">
                    Get timely reminders about your assigned person and important event dates.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </main>
    </Box>
  );
};

export default HomePage;