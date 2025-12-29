import { A } from '@solidjs/router';
import { useAuth } from '../AuthProvider';
import { Button } from '../components/ui/Button';
import { Box, Container, Stack, Typography } from '@suid/material';

const Header = () => {
  const auth = useAuth();

  return (
    <Box component="header" py={3} borderBottom="1px solid" borderColor="divider">
      <Container maxWidth="lg">
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <A href="/" style={{ "text-decoration": 'none' }}>
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
                backgroundClip: 'text', 
                color: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Secret Santa
            </Typography>
          </A>

          <Stack direction="row" spacing={2} alignItems="center">
            {auth.user ? (
              <>
                <A href="/games" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  <Button variant="text">Games</Button>
                </A>
                <A href="/profile" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  <Button variant="text">Profile</Button>
                </A>
                <Button 
                  variant="outlined" 
                  onClick={() => auth.logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <A href="/login" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  <Button variant="text">Login</Button>
                </A>
                <A href="/register" style={{ color: 'inherit', "text-decoration": 'none' }}>
                  <Button variant="contained">Sign Up</Button>
                </A>
              </>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Header;