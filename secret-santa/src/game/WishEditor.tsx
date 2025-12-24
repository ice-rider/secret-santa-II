import { createSignal, onMount } from 'solid-js';

interface WishEditorProps {
  gameId: string;
}

const WishEditor = (_props: WishEditorProps) => {
  const [wishes, setWishes] = createSignal<string>('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  onMount(async () => {
    // In a real implementation, we would fetch the user's wishes for this game
    // For now, we'll just initialize with an empty string
    try {
      setLoading(true);
      // Placeholder: fetch wishes API call would go here
      // const userWishes = await gamesService.getUserWishes(_props.gameId);
      // setWishes(userWishes);
    } catch (err) {
      setError('Failed to load wishes');
      console.error('Error loading wishes:', err);
    } finally {
      setLoading(false);
    }
  });

  const saveWishes = async () => {
    try {
      setLoading(true);
      setError('');
      // In a real implementation, we would save the wishes to the backend
      // await gamesService.updateUserWishes(_props.gameId, wishes());
      // For now, just show a success message
      alert('Wishes saved successfully!');
    } catch (err) {
      setError('Failed to save wishes');
      console.error('Error saving wishes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="wish-editor">
      {error() && (
        <div class="error-message">
          {error()}
        </div>
      )}
      
      <textarea
        value={wishes()}
        onInput={(e) => setWishes(e.currentTarget.value)}
        placeholder="Enter your wish list here... (e.g., 'I would love a new book, a cozy sweater, or a nice coffee mug')"
        rows={6}
        class="wishes-textarea"
        disabled={loading()}
      />
      
      <div class="wish-editor-actions">
        <button 
          onClick={saveWishes} 
          disabled={loading()}
          class="save-wishes-btn"
        >
          {loading() ? 'Saving...' : 'Save Wishes'}
        </button>
      </div>
    </div>
  );
};

export default WishEditor;