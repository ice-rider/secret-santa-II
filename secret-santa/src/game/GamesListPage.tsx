import { createSignal, onMount } from 'solid-js';
import type { Game, GameFilter } from '../types';
import gamesService from '../services/games.service';
import GameCard from '../game/GameCard';
import GameCreationForm from './GameCreationForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Box, Container, Typography, Stack, Paper } from '@suid/material';

const GamesListPage = () => {
  const [games, setGames] = createSignal<Game[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [filter, setFilter] = createSignal<GameFilter>({ type: 'all' });
  const [showCreateModal, setShowCreateModal] = createSignal(false);

  onMount(() => {
    loadGames();
  });

  const loadGames = async () => {
    try {
      setLoading(true);
      setError('');
      const gamesData = await gamesService.getGames(filter());
      setGames(gamesData);
    } catch (err) {
      setError('Failed to load games');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type: 'all' | 'created' | 'participating') => {
    setFilter({ type });
    // Reset pagination if applicable
    loadGames();
  };

  const handleGameCreated = (newGame: Game) => {
    // Add the new game to the list
    setGames([newGame, ...games()]);
    setShowCreateModal(false);
  };

  return (
    <Box
      component="div"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))'
      }}
    >
      {/* Header */}
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 8 }}>
        <Typography variant="h4" component="h1">Your Games</Typography>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Game
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Filters */}
        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
          <Paper
            sx={{
              p: 0.5,
              backgroundColor: 'rgba(245, 245, 245, 0.5)',
              borderRadius: '4px'
            }}
          >
            <Stack direction="row" spacing={0.5}>
              <Button
                variant={filter().type === 'all' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleFilterChange('all')}
              >
                All Games
              </Button>
              <Button
                variant={filter().type === 'created' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleFilterChange('created')}
              >
                Created by Me
              </Button>
              <Button
                variant={filter().type === 'participating' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleFilterChange('participating')}
              >
                Participating
              </Button>
            </Stack>
          </Paper>
        </Box>

        {error() && (
          <Box component="div" sx={{ mb: 6, textAlign: 'center' }}>
            <Typography color="error">{error()}</Typography>
          </Box>
        )}

        {loading() ? (
          <Box component="div" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </Box>
        ) : (
          <Box component="div" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 6 }}>
            {games().length > 0 ? (
              games().map((game) => (
                <GameCard game={game} />
              ))
            ) : (
              <Box component="div" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 12 }}>
                <Card sx={{ maxWidth: '400px', mx: 'auto' }}>
                  <Box component="div" sx={{ p: 8 }}>
                    <Typography color="textSecondary">
                      No games found. {filter().type === 'all' ? 'Create your first game!' : 'Try changing your filter.'}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            )}
          </Box>
        )}

        {showCreateModal() && (
          <Box
            component="div"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <GameCreationForm
              onClose={() => setShowCreateModal(false)}
              onSuccess={handleGameCreated}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default GamesListPage;