import { createSignal, onMount } from 'solid-js';
import type { Game, GameFilter } from '../types';
import gamesService from '../services/games.service';
import GameCard from '../game/GameCard';
import GameCreationForm from './GameCreationForm';

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
    <div class="games-list-page">
      <header class="games-header">
        <h1>Your Games</h1>
        <button class="create-game-button" onClick={() => setShowCreateModal(true)}>
          Create Game
        </button>
      </header>

      <div class="games-filters">
        <button 
          class={`filter-btn ${filter().type === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All Games
        </button>
        <button 
          class={`filter-btn ${filter().type === 'created' ? 'active' : ''}`}
          onClick={() => handleFilterChange('created')}
        >
          Created by Me
        </button>
        <button 
          class={`filter-btn ${filter().type === 'participating' ? 'active' : ''}`}
          onClick={() => handleFilterChange('participating')}
        >
          Participating
        </button>
      </div>

      {error() && (
        <div class="error-message">
          {error()}
        </div>
      )}

      {loading() ? (
        <div class="loading">Loading games...</div>
      ) : (
        <div class="games-grid">
          {games().length > 0 ? (
            games().map((game) => (
              <GameCard game={game} />
            ))
          ) : (
            <div class="no-games">
              <p>No games found. {filter().type === 'all' ? 'Create your first game!' : 'Try changing your filter.'}</p>
            </div>
          )}
        </div>
      )}

      {showCreateModal() && (
        <div class="modal-overlay">
          <GameCreationForm 
            onClose={() => setShowCreateModal(false)} 
            onSuccess={handleGameCreated} 
          />
        </div>
      )}
    </div>
  );
};

export default GamesListPage;