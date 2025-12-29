import { createSignal, onMount, onCleanup } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import type { Game } from '../types';
import gamesService from '../services/games.service';
import sseService from '../services/sse.service';
import type { SseEvent } from '../services/sse.service';
import { useAuth } from '../AuthProvider';
import ParticipantsList from './ParticipantsList';
import WishEditor from './WishEditor';
import AssignmentReveal from './AssignmentReveal';
import Notification from '../components/ui/Notification';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Box, Container, Typography, Chip, Grid } from '@suid/material';

const GameDetailsPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const [game, setGame] = createSignal<Game | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [inviteLink, setInviteLink] = createSignal('');
  const [notification, setNotification] = createSignal<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  onMount(async () => {
    try {
      setLoading(true);
      setError('');
      const gameId = params.id;
      if (!gameId) {
        setError('Game ID is required');
        return;
      }
      const gameData = await gamesService.getGameById(gameId);
      setGame(gameData);

      // Generate invite link
      const link = `${window.location.origin}/games/${gameId}`;
      setInviteLink(link);

      // Connect to SSE for real-time updates
      sseService.connect(gameId);

      // Subscribe to game events
      sseService.subscribe('participant-joined', handleParticipantJoined);
      sseService.subscribe('participant-left', handleParticipantLeft);
      sseService.subscribe('game-started', handleGameStarted);
      sseService.subscribe('game-revealed', handleGameRevealed);
    } catch (err) {
      setError('Failed to load game details');
      console.error('Error loading game details:', err);
    } finally {
      setLoading(false);
    }
  });

  // Clean up SSE connection on component unmount
  onCleanup(() => {
    sseService.disconnect();

    // Unsubscribe from events
    sseService.unsubscribe('participant-joined', handleParticipantJoined);
    sseService.unsubscribe('participant-left', handleParticipantLeft);
    sseService.unsubscribe('game-started', handleGameStarted);
    sseService.unsubscribe('game-revealed', handleGameRevealed);
  });

  const joinGame = async () => {
    if (!game()) return;

    try {
      setLoading(true);
      const updatedGame = await gamesService.joinGame(game()!.id);
      setGame(updatedGame);
      setNotification({message: 'Successfully joined the game!', type: 'success'});
    } catch (err: any) {
      setError('Failed to join game');
      setNotification({message: err.response?.data?.message || 'Failed to join game', type: 'error'});
      console.error('Error joining game:', err);
    } finally {
      setLoading(false);
    }
  };

  const leaveGame = async () => {
    if (!game()) return;

    try {
      setLoading(true);
      const updatedGame = await gamesService.leaveGame(game()!.id);
      setGame(updatedGame);
      setNotification({message: 'Successfully left the game', type: 'success'});
    } catch (err: any) {
      setError('Failed to leave game');
      setNotification({message: err.response?.data?.message || 'Failed to leave game', type: 'error'});
      console.error('Error leaving game:', err);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!game() || !user || !game()!.isCreator) return;

    try {
      setLoading(true);
      // Update game status to active
      const updatedGame = await gamesService.updateGame(game()!.id, {
        status: 'active'
      });
      setGame(updatedGame);
      setNotification({message: 'Game started successfully!', type: 'success'});
    } catch (err: any) {
      setError('Failed to start game');
      setNotification({message: err.response?.data?.message || 'Failed to start game', type: 'error'});
      console.error('Error starting game:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink()) {
      navigator.clipboard.writeText(inviteLink())
        .then(() => {
          setNotification({message: 'Link copied to clipboard!', type: 'success'});
        })
        .catch(err => {
          setError('Failed to copy link');
          setNotification({message: 'Failed to copy link', type: 'error'});
          console.error('Error copying link:', err);
        });
    }
  };

  const removeParticipant = async (_participantId: string) => {
    if (!game() || !user || !game()!.isCreator) return;

    try {
      setLoading(true);
      // In a real implementation, you might have a specific API call to remove a participant
      // For now, we'll just refresh the game data
      const updatedGame = await gamesService.getGameById(game()!.id);
      setGame(updatedGame);
      setNotification({message: 'Participant removed successfully', type: 'success'});
    } catch (err: any) {
      setError('Failed to remove participant');
      setNotification({message: err.response?.data?.message || 'Failed to remove participant', type: 'error'});
      console.error('Error removing participant:', err);
    } finally {
      setLoading(false);
    }
  };

  // SSE event handlers
  const handleParticipantJoined = (event: SseEvent) => {
    // Update game data when a participant joins
    if (event.gameId === params.id) {
      // Show notification
      setNotification({message: `${event.data.participantName} joined the game!`, type: 'info'});

      // Refresh game data to update participant count
      refreshGameData();
    }
  };

  const handleParticipantLeft = (event: SseEvent) => {
    // Update game data when a participant leaves
    if (event.gameId === params.id) {
      // Show notification
      setNotification({message: `${event.data.participantName} left the game.`, type: 'info'});

      // Refresh game data to update participant count
      refreshGameData();
    }
  };

  const handleGameStarted = (event: SseEvent) => {
    // Update game status when game starts
    if (event.gameId === params.id) {
      // Show notification
      setNotification({message: 'The game has started! Check your assignment.', type: 'success'});

      // Refresh game data to update status
      refreshGameData();
    }
  };

  const handleGameRevealed = (event: SseEvent) => {
    // Handle game reveal event
    if (event.gameId === params.id) {
      // Show notification
      setNotification({message: 'Secret assignments have been revealed!', type: 'success'});

      // Refresh game data to update status
      refreshGameData();
    }
  };

  const refreshGameData = async () => {
    try {
      const gameId = params.id;
      if (!gameId) return;

      const updatedGame = await gamesService.getGameById(gameId);
      setGame(updatedGame);
    } catch (err) {
      console.error('Error refreshing game data:', err);
    }
  };

  if (loading()) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading game details...</Typography>
      </Box>
    );
  }

  if (error()) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <Box sx={{ p: 4 }}>
            <Typography color="error" mb={2}>{error()}</Typography>
            <A href="/games" style={{ "text-decoration": 'none' }}>
              <Button variant="outlined">Back to Games</Button>
            </A>
          </Box>
        </Card>
      </Container>
    );
  }

  const currentGame = game();
  if (!currentGame) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <Box sx={{ p: 4 }}>
            <Typography color="error" mb={2}>Game not found</Typography>
            <A href="/games" style={{ "text-decoration": 'none' }}>
              <Button variant="outlined">Back to Games</Button>
            </A>
          </Box>
        </Card>
      </Container>
    );
  }

  // Function to get status color based on game status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString!).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <A href="/games" style={{ "text-decoration": 'none', color: 'inherit' }}>
          <Typography variant="body2" color="textSecondary" mb={2}>&larr; Back to Games</Typography>
        </A>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">{currentGame.name}</Typography>
          <Chip
            label={currentGame.status.charAt(0).toUpperCase() + currentGame.status.slice(1)}
            color={getStatusColor(currentGame.status) as any}
            variant="outlined"
          />
        </Box>
      </Box>

      {error() && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error()}</Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Game Info Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ p: 3 }}>
              {currentGame.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" mb={1}>Description</Typography>
                  <Typography variant="body1" color="textSecondary">
                    {currentGame.description}
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h6">{currentGame.participantCount} / {currentGame.participantLimit}</Typography>
                    <Typography variant="caption" color="textSecondary">Participants</Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h6">{currentGame.creatorName}</Typography>
                    <Typography variant="caption" color="textSecondary">Creator</Typography>
                  </Box>
                </Grid>

                {currentGame.startDate && (
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="h6">{formatDate(currentGame.startDate)}</Typography>
                      <Typography variant="caption" color="textSecondary">Start Date</Typography>
                    </Box>
                  </Grid>
                )}

                {currentGame.endDate && (
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="h6">{formatDate(currentGame.endDate)}</Typography>
                      <Typography variant="caption" color="textSecondary">End Date</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Game Actions Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>Actions</Typography>

              {user && currentGame.isCreator ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {currentGame.status === 'draft' && currentGame.participantCount >= 3 && (
                    <Button
                      variant="contained"
                      onClick={startGame}
                      disabled={loading()}
                      fullWidth
                    >
                      {loading() ? 'Starting...' : 'Start Game'}
                    </Button>
                  )}
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    You are the creator of this game
                  </Typography>
                </Box>
              ) : user && currentGame.isParticipant ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={leaveGame}
                    disabled={loading()}
                    fullWidth
                  >
                    {loading() ? 'Leaving...' : 'Leave Game'}
                  </Button>
                </Box>
              ) : user ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={joinGame}
                    disabled={loading()}
                    fullWidth
                  >
                    {loading() ? 'Joining...' : 'Join Game'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" textAlign="center" mb={2}>
                    Please log in to join this game
                  </Typography>
                  <A href="/login" style={{ "text-decoration": 'none' }}>
                    <Button variant="contained" fullWidth>
                      Log In
                    </Button>
                  </A>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Invite Link Section */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>Invite Others</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input
                  value={inviteLink()}
                  readonly
                  fullWidth
                  disabled
                />
                <Button
                  id="copy-link-btn"
                  onClick={copyInviteLink}
                  variant="outlined"
                >
                  Copy Link
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Participants List */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>Participants ({currentGame.participantCount})</Typography>
              <ParticipantsList
                participants={currentGame.participants || []}
                isCreator={currentGame.isCreator}
                onRemoveParticipant={removeParticipant}
              />
            </Box>
          </Card>
        </Grid>

        {/* Wish Editor - only for participants in active games */}
        {(user && currentGame.isParticipant && currentGame.status === 'active') && (
          <Grid item xs={12}>
            <WishEditor gameId={currentGame.id} />
          </Grid>
        )}

        {/* Assignment Reveal - only after game starts */}
        {currentGame.status === 'active' && (
          <Grid item xs={12}>
            <AssignmentReveal
              gameId={currentGame.id}
              isGameStarted={currentGame.status === 'active'}
            />
          </Grid>
        )}
      </Grid>

      {/* Notification */}
      {notification() && (
        <Notification
          message={notification()!.message}
          type={notification()!.type}
          duration={4000}
        />
      )}
    </Container>
  );
};

export default GameDetailsPage;