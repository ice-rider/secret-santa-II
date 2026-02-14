// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApiProvider, useApiClient } from './contexts/ApiContext';
import { AuthProvider, useAuth } from './contexts/auth/AuthContext';
import HomePage from './components/HomePage';
import GamesListPage from './components/games/GamesListPage';
import GamePage from './components/games/GamePage';
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import OAuthCallback from './components/auth/callback/OAuthCallback';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#d4af37', // Gold color for Christmas theme
    },
    secondary: {
      main: '#c62828', // Dark red for Christmas theme
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
});

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loader
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Separate component for protected routes that needs auth context
const ProtectedContent: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            🎅 Secret Santa
          </Typography>
          <div>
            <Button color="inherit" href="/">Home</Button>
            <Button color="inherit" href="/games">My Games</Button>
            {!user ? (
              <>
                <Button color="inherit" href="/register">Register</Button>
                <Button color="inherit" href="/login">Login</Button>
              </>
            ) : (
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            )}
          </div>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ maxWidth: '100vw', mt: 2, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <GamesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/:id"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/games" replace />} />
          <Route path="/register" element={!user ? <RegistrationForm /> : <Navigate to="/games" replace />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>

      <footer style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
        <p>© {new Date().getFullYear()} Secret Santa - Spread joy and surprises! 🎁</p>
      </footer>
    </>
  );
};

// App content that needs access to auth context
const AppContent: React.FC = () => {
  const { apiClient, authService } = useApiClient();

  return (
    <AuthProvider apiClient={apiClient} authService={authService}>
      <ProtectedContent />
    </AuthProvider>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <ApiProvider>
          <Router>
            <AppContent />
          </Router>
        </ApiProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;