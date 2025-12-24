import { createSignal, onMount, onCleanup } from 'solid-js';
import { useParams } from '@solidjs/router';
import type { Game } from '../types';
import gamesService from '../services/games.service';
import sseService from '../services/sse.service';
import type { SseEvent } from '../services/sse.service';
import { useAuth } from '../AuthProvider';
import ParticipantsList from './ParticipantsList';
import WishEditor from './WishEditor';
import AssignmentReveal from './AssignmentReveal';

const GameDetailsPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const [game, setGame] = createSignal<Game | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [inviteLink, setInviteLink] = createSignal('');

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

  const startGame = async () => {
    if (!game() || !user || !game()!.isCreator) return;

    try {
      setLoading(true);
      // Update game status to active
      const updatedGame = await gamesService.updateGame(game()!.id, {
        status: 'active'
      });
      setGame(updatedGame);
    } catch (err) {
      setError('Failed to start game');
      console.error('Error starting game:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink()) {
      navigator.clipboard.writeText(inviteLink())
        .then(() => {
          // Show success feedback
          const button = document.getElementById('copy-link-btn');
          if (button) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
              if (button) button.textContent = originalText;
            }, 2000);
          }
        })
        .catch(err => {
          setError('Failed to copy link');
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
    } catch (err) {
      setError('Failed to remove participant');
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
      showNotification(`${event.data.participantName} joined the game!`);

      // Refresh game data to update participant count
      refreshGameData();
    }
  };

  const handleParticipantLeft = (event: SseEvent) => {
    // Update game data when a participant leaves
    if (event.gameId === params.id) {
      // Show notification
      showNotification(`${event.data.participantName} left the game.`);

      // Refresh game data to update participant count
      refreshGameData();
    }
  };

  const handleGameStarted = (event: SseEvent) => {
    // Update game status when game starts
    if (event.gameId === params.id) {
      // Show notification
      showNotification('The game has started! Check your assignment.');

      // Refresh game data to update status
      refreshGameData();
    }
  };

  const handleGameRevealed = (event: SseEvent) => {
    // Handle game reveal event
    if (event.gameId === params.id) {
      // Show notification
      showNotification('Secret assignments have been revealed!');

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

  const showNotification = (message: string) => {
    // Simple notification implementation
    // In a real app, you might use a more sophisticated notification system
    alert(message);
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
        {/* Game Info Section */}
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

        {/* Invite Link Section */}
        <section class="invite-section">
          <h3>Invite Others</h3>
          <div class="invite-link-container">
            <input
              type="text"
              value={inviteLink()}
              readonly
              class="invite-link"
            />
            <button
              id="copy-link-btn"
              class="copy-link-btn"
              onClick={copyInviteLink}
            >
              Copy Link
            </button>
          </div>
        </section>

        {/* Participants List */}
        <section class="participants-section">
          <h3>Participants ({currentGame.participantCount})</h3>
          <ParticipantsList
            participants={currentGame.participants || []}
            isCreator={currentGame.isCreator}
            onRemoveParticipant={removeParticipant}
          />
        </section>

        {/* Wish Editor - only for participants in active games */}
        {(user && currentGame.isParticipant && currentGame.status === 'active') && (
          <section class="wish-editor-section">
            <h3>Your Wish List</h3>
            <WishEditor gameId={currentGame.id} />
          </section>
        )}

        {/* Assignment Reveal - only after game starts */}
        {currentGame.status === 'active' && (
          <section class="assignment-section">
            <h3>Your Assignment</h3>
            <AssignmentReveal gameId={currentGame.id} />
          </section>
        )}

        {/* Game Actions */}
        <section class="game-actions">
          {user && currentGame.isCreator ? (
            <div class="creator-actions">
              {currentGame.status === 'draft' && currentGame.participantCount >= 3 && (
                <button
                  class="start-game-btn"
                  onClick={startGame}
                  disabled={loading()}
                >
                  {loading() ? 'Starting...' : 'Start Game'}
                </button>
              )}
              <div class="action-info">
                <p>You are the creator of this game</p>
              </div>
            </div>
          ) : user && currentGame.isParticipant ? (
            <div class="participant-actions">
              <button
                class="leave-game-btn"
                onClick={leaveGame}
                disabled={loading()}
              >
                {loading() ? 'Leaving...' : 'Leave Game'}
              </button>
            </div>
          ) : user ? (
            <div class="join-actions">
              <button
                class="join-game-btn"
                onClick={joinGame}
                disabled={loading()}
              >
                {loading() ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          ) : (
            <div class="login-prompt">
              <p>Please log in to join this game</p>
              <a href="/login" class="login-link">Log In</a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default GameDetailsPage;