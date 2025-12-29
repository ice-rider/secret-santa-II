import { createSignal, onMount } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Box, Container, Typography } from '@suid/material';
import gamesService from '../services/games.service';
import type { Game } from '../types';

const JoinGamePage = () => {
  const params = useParams();
  const [gameId, setGameId] = createSignal(params.id || '');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal(false);
  const [game, setGame] = createSignal<Game | null>(null);

  onMount(async () => {
    if (params.id) {
      setGameId(params.id);
      await loadGameDetails(params.id);
    }
  });

  const loadGameDetails = async (id: string) => {
    try {
      setLoading(true);
      const gameData = await gamesService.getGameById(id);
      setGame(gameData);
    } catch (err) {
      setError('Failed to load game details');
      console.error('Error loading game details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameId()) {
      setError('Please enter a game ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await gamesService.joinGame(gameId());
      setSuccess(true);
      
      // Optionally redirect to game details page
      setTimeout(() => {
        window.location.href = `/games/${gameId()}`;
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join game');
      console.error('Error joining game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="div"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4 }}>
          <Typography variant="h5" textAlign="center" mb={3}>
            Join a Secret Santa Game
          </Typography>

          {error() && (
            <Typography color="error" textAlign="center" mb={2}>
              {error()}
            </Typography>
          )}

          {success() ? (
            <Box textAlign="center">
              <Typography variant="h6" color="success.main" mb={2}>
                Successfully joined the game!
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Redirecting to game details...
              </Typography>
            </Box>
          ) : (
            <>
              {!game() && (
                <Box sx={{ mb: 3 }}>
                  <Input
                    label="Game ID"
                    value={gameId()}
                    onInput={(e: any) => setGameId(e.currentTarget.value)}
                    fullWidth
                    disabled={loading()}
                    placeholder="Enter the game ID"
                  />
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => loadGameDetails(gameId())}
                      disabled={loading() || !gameId()}
                    >
                      Load Game Details
                    </Button>
                  </Box>
                </Box>
              )}

              {game() && (
                <Box mb={3}>
                  <Typography variant="h6" textAlign="center" mb={1}>
                    {game()?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center" mb={2}>
                    {game()?.description || 'No description provided'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                    <Typography variant="body2">
                      Creator: {game()?.creatorName}
                    </Typography>
                    <Typography variant="body2">
                      Participants: {game()?.participantCount}/{game()?.participantLimit}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleJoinGame}
                  disabled={loading() || !gameId()}
                  fullWidth
                >
                  {loading() ? 'Joining...' : 'Join Game'}
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <A href="/register" style={{ color: 'primary.main' }}>
                Sign up
              </A>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default JoinGamePage;