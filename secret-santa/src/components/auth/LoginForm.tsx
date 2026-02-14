// frontend/src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../../contexts/ApiContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/auth/AuthContext';
import OAuthButtons from './OAuthButtons';

const LoginForm: React.FC = () => {
  const { authService } = useApiClient();
  const { showNotification } = useNotification();
  const { login } = useAuth(); // Use the login function from auth context
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password); // Use the login function from auth context

      showNotification('Login successful!', 'success');
      navigate('/games');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Secret Santa Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>

        <Box sx={{ mt: 3 }}>
          <OAuthButtons
            onAuthSuccess={() => {
              showNotification('Authentication successful!', 'success');
              navigate('/games');
            }}
            onError={(error) => {
              showNotification(error, 'error');
            }}
          />
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Button
              size="small"
              color="primary"
              onClick={() => navigate('/register')}
            >
              Register here
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;