import { createSignal } from 'solid-js';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import OAuthButtons from '../auth/OAuthButtons';
import TelegramAuth from '../auth/TelegramAuth';
import { Box, Container } from '@suid/material';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = createSignal(true);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))'
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)'
          }}
        >
          {isLoginView() ? (
            <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
          )}
        </Box>

        <Box textAlign="center" my={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&::before': {
                content: '""',
                flex: 1,
                borderTop: '1px solid',
                borderColor: 'divider'
              },
              '&::after': {
                content: '""',
                flex: 1,
                borderTop: '1px solid',
                borderColor: 'divider'
              },
              '& > span': {
                px: 2,
                color: 'text.secondary'
              }
            }}
          >
            <span>or</span>
          </Box>
        </Box>

        <Box
          sx={{
            p: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)'
          }}
        >
          <OAuthButtons />
          <TelegramAuth />
        </Box>
      </Container>
    </Box>
  );
};

export default AuthPage;