import { createSignal, onMount } from 'solid-js';
import { useParams } from '@solidjs/router';
import type { Game } from '../types';
import gamesService from '../services/games.service';
import { useAuth } from '../AuthProvider';

const GameDetailsPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const [game, setGame] = createSignal<Game | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

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
    } catch (err) {
      setError('Failed to load game details');
      console.error('Error loading game details:', err);
    } finally {
      setLoading(false);
    }
  });

  const joinGame = async () => {
    if (!game()) return;
    
    try {
      setLoading(true);
      const updatedGame = await gamesService.joinGame(game()!.id);
      setGame(updatedGame);
    } catch (err) {
      setError('Failed to join game');
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
    } catch (err) {
      setError('Failed to leave game');
      console.error('Error leaving game:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading()) {
    return <div class="loading">Loading game details...</div>;
  }

  if (error()) {
    return (
      <div class="error-message">
        {error()}
        <a href="/games">Back to Games</a>
      </div>
    );
  }

  const currentGame = game();
  if (!currentGame) {
    return (
      <div class="error-message">
        Game not found
        <a href="/games">Back to Games</a>
      </div>
    );
  }

  // Function to get status badge class based on game status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString!).toLocaleDateString();
  };

  return (
    <div class="game-details-page">
      <header class="game-details-header">
        <a href="/games" class="back-link">&larr; Back to Games</a>
        <div class="game-header-content">
          <h1>{currentGame.name}</h1>
          <span class={`status-badge ${getStatusClass(currentGame.status)}`}>
            {currentGame.status.charAt(0).toUpperCase() + currentGame.status.slice(1)}
          </span>
        </div>
      </header>

      {error() && (
        <div class="error-message">
          {error()}
        </div>
      )}

      <main class="game-details-main">
        <section class="game-info">
          <div class="game-basic-info">
            {currentGame.description && (
              <div class="game-description">
                <h3>Description</h3>
                <p>{currentGame.description}</p>
              </div>
            )}

            <div class="game-stats">
              <div class="stat-card">
                <h4>Participants</h4>
                <p>{currentGame.participantCount} / {currentGame.participantLimit}</p>
              </div>
              
              <div class="stat-card">
                <h4>Creator</h4>
                <p>{currentGame.creatorName}</p>
              </div>
              
              {currentGame.startDate && (
                <div class="stat-card">
                  <h4>Start Date</h4>
                  <p>{formatDate(currentGame.startDate)}</p>
                </div>
              )}
              
              {currentGame.endDate && (
                <div class="stat-card">
                  <h4>End Date</h4>
                  <p>{formatDate(currentGame.endDate)}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section class="game-actions">
          {user && currentGame.isParticipant ? (
            <div class="action-buttons">
              <button 
                class="leave-game-btn" 
                onClick={leaveGame}
                disabled={loading()}
              >
                {loading() ? 'Leaving...' : 'Leave Game'}
              </button>
            </div>
          ) : user && !currentGame.isCreator ? (
            <div class="action-buttons">
              <button 
                class="join-game-btn" 
                onClick={joinGame}
                disabled={loading()}
              >
                {loading() ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          ) : (
            <div class="action-info">
              <p>You created this game</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default GameDetailsPage;