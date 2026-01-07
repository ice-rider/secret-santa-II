import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, CircularProgress, Link } from '@mui/material';
import { useApiClient } from '../../contexts/ApiContext';
import { loginSchema, type LoginData } from '../../lib/validation/auth';
import { ZodError } from 'zod';
import OAuthButtons from './OAuthButtons';

const LoginForm: React.FC = () => {
  const { authService } = useApiClient();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    setError(null);

    try {
      // Validate form data using Zod
      loginSchema.parse(formData);

      // For mock implementation, we'll simulate a successful login
      // In a real app, you would call the actual API
      const mockToken = 'mock-jwt-token-for-testing';

      // Store the token in the API client
      authService.getApiClient().setAuthToken(mockToken);

      setSuccess(true);

      // Redirect to games page after successful login
      setTimeout(() => {
        window.location.href = '/games';
      }, 1500);
    } catch (err: any) {
      if (err instanceof ZodError) {
        // Handle Zod validation errors
        const zodErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path) {
            const field = issue.path[0] as string;
            zodErrors[field] = issue.message;
          }
        });
        setErrors(zodErrors);
      } else {
        console.error('Login error:', err);
        setError(err.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Sign In
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Login successful! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          required
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          required
          error={!!errors.password}
          helperText={errors.password}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </form>

      <OAuthButtons
        onAuthSuccess={() => {
          // Handle successful OAuth login
          window.location.href = '/dashboard';
        }}
        onError={(error) => {
          setError(error);
        }}
      />

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link href="/register" underline="hover" component="a">
            Register here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;