// frontend/src/components/games/GamesListPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../../contexts/ApiContext';
import { useNotification } from '../../contexts/NotificationContext';
import GameCard from './GameCard';
import GameCreationModal from './GameCreationModal';
import { GameDto } from '../../lib/api/game';

const GamesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { gameService } = useApiClient();
  const { showNotification } = useNotification();
  const [games, setGames] = useState<GameDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gameService.getUserGames();
      setGames(response.data);
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to fetch games', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGameCreated = (gameId: number) => {
    // Navigate to the newly created game page
    navigate(`/games/${gameId}`);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Your Secret Santa Games</Typography>
          <GameCreationModal onSuccess={handleGameCreated} />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (games && games.length > 0) ? (
          <Grid container spacing={3}>
            {games.map((game) => (
              <Grid item xs={12} sm={6} md={4} key={game.id}>
                <GameCard game={game} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              You haven't joined any games yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Create your first game or ask for a game code to join
            </Typography>
            <GameCreationModal onSuccess={handleGameCreated} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default GamesListPage;