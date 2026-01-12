// frontend/src/components/common/AccessDenied.tsx
import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC<{ message?: string }> = ({ message = "Access denied. Please log in to continue." }) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          py: 4
        }}
      >
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            width: '100%',
            textAlign: 'center',
            backgroundColor: '#fff9f9' // Light red background to indicate error
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="h6" gutterBottom>
            {message}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to view this page.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGoToLogin}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default AccessDenied;