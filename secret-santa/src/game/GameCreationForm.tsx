import { createSignal } from 'solid-js';
import type { CreateGameRequest, Game } from '../types';
import gamesService from '../services/games.service';

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
    <div class="game-creation-form-overlay">
      <div class="game-creation-form">
        <div class="form-header">
          <h2>Create New Game</h2>
          <button class="close-button" onClick={props.onClose} disabled={loading()}>
            &times;
          </button>
        </div>
        
        {error() && (
          <div class="error-message">
            {error()}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="game-name">Game Name *</label>
            <input
              id="game-name"
              type="text"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              required
              disabled={loading()}
              placeholder="Enter game name"
            />
          </div>
          
          <div class="form-group">
            <label for="game-description">Description</label>
            <textarea
              id="game-description"
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
              disabled={loading()}
              placeholder="Enter game description"
              rows={3}
            />
          </div>
          
          <div class="form-group">
            <label for="participant-limit">Participant Limit *</label>
            <input
              id="participant-limit"
              type="number"
              min="3"
              max="100"
              value={participantLimit()}
              onInput={(e) => setParticipantLimit(Number(e.currentTarget.value))}
              required
              disabled={loading()}
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate()}
                onInput={(e) => setStartDate(e.currentTarget.value)}
                disabled={loading()}
              />
            </div>
            
            <div class="form-group">
              <label for="end-date">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate()}
                onInput={(e) => setEndDate(e.currentTarget.value)}
                disabled={loading()}
                min={startDate() || undefined}
              />
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" onClick={props.onClose} disabled={loading()}>
              Cancel
            </button>
            <button type="submit" disabled={loading()}>
              {loading() ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameCreationForm;