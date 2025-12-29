import { createSignal } from 'solid-js';
import type { CreateGameRequest, Game } from '../types';
import gamesService from '../services/games.service';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Box, Typography } from '@suid/material';

interface GameCreationFormProps {
  onClose: () => void;
  onSuccess: (game: Game) => void;
}

const GameCreationForm = (props: GameCreationFormProps) => {
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [participantLimit, setParticipantLimit] = createSignal<number>(10);
  const [startDate, setStartDate] = createSignal('');
  const [endDate, setEndDate] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const gameData: CreateGameRequest = {
        name: name(),
        description: description() || undefined,
        participantLimit: participantLimit(),
        startDate: startDate() || undefined,
        endDate: endDate() || undefined,
      };

      const newGame = await gamesService.createGame(gameData);
      props.onSuccess(newGame);
      props.onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create game');
      console.error('Error creating game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Create New Game</Typography>
          <Button
            variant="text"
            onClick={props.onClose}
            disabled={loading()}
            style={{ minWidth: 'auto' }}
          >
            &times;
          </Button>
        </Box>

        {error() && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error">{error()}</Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Input
              label="Game Name *"
              value={name()}
              onInput={(e: any) => setName(e.currentTarget.value)}
              required
              disabled={loading()}
              placeholder="Enter game name"
            />

            <Input
              label="Description"
              multiline
              rows={3}
              value={description()}
              onInput={(e: any) => setDescription(e.currentTarget.value)}
              disabled={loading()}
              placeholder="Enter game description"
            />

            <Input
              label="Participant Limit *"
              type="number"
              min="3"
              max="100"
              value={participantLimit().toString()}
              onInput={(e: any) => setParticipantLimit(Number(e.currentTarget.value))}
              required
              disabled={loading()}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Input
                label="Start Date"
                type="date"
                value={startDate()}
                onInput={(e: any) => setStartDate(e.currentTarget.value)}
                disabled={loading()}
              />

              <Input
                label="End Date"
                type="date"
                value={endDate()}
                onInput={(e: any) => setEndDate(e.currentTarget.value)}
                disabled={loading()}
                min={startDate()}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                type="button"
                onClick={props.onClose}
                disabled={loading()}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={loading()}
              >
                {loading() ? 'Creating...' : 'Create Game'}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Card>
  );
};

export default GameCreationForm;