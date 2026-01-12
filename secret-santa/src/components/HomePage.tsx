// frontend/src/components/HomePage.tsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/auth/AuthContext';
import JoinGameModal from './games/JoinGameModal';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const handleCreateGame = () => {
    if (isAuthenticated) {
      navigate('/games');
    } else {
      navigate('/login');
    }
  };

  const handleJoinGame = () => {
    if (isAuthenticated) {
      setJoinModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleJoinGameSuccess = () => {
    // Optionally refresh the game list or navigate to games page after joining
    // For now, just close the modal and let the user decide what to do next
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            🎅 Secret Santa
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            Organize your gift exchange with friends and family
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Secret Santa is a fun way to exchange gifts during holidays.
            Create a game, invite participants, and let the system randomly assign
            who gives a gift to whom. Everyone keeps their assignment secret
            until the big day!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCreateGame}
                  sx={{ minWidth: 150 }}
                >
                  Create Game
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleJoinGame}
                  sx={{ minWidth: 150 }}
                >
                  Join Game
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  sx={{ minWidth: 150 }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleRegister}
                  sx={{ minWidth: 150 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Paper>

        <JoinGameModal
          open={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          onSuccess={handleJoinGameSuccess}
        />

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                🎁 How It Works
              </Typography>
              <Typography variant="body2">
                1. Create a game and invite friends<br/>
                2. Each person adds their wish list<br/>
                3. System randomly assigns gift-givers<br/>
                4. Keep your assignment secret!<br/>
                5. Exchange gifts on the big day
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                🔒 Privacy First
              </Typography>
              <Typography variant="body2">
                • No personal information shared<br/>
                • Assignments remain secret<br/>
                • Secure connections<br/>
                • Data encrypted
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                🌟 Features
              </Typography>
              <Typography variant="body2">
                • Real-time updates<br/>
                • Wish lists<br/>
                • Game management<br/>
                • Responsive design<br/>
                • Easy to use
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link href="https://github.com" target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <GitHubIcon />
            View Source Code
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;