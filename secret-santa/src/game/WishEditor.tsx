import { createSignal, onMount } from 'solid-js';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Box, Typography } from '@suid/material';

interface WishEditorProps {
  gameId: string;
}

const WishEditor = (_props: WishEditorProps) => {
  const [wishes, setWishes] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [saved, setSaved] = createSignal(false);

  // In a real implementation, you would fetch existing wishes for this user/game
  onMount(() => {
    // Load existing wishes if any
    // const existingWishes = await fetchWishes(props.gameId);
    // setWishes(existingWishes);
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, you would save wishes to the backend
      // await saveWishes(props.gameId, wishes());
      setSaved(true);
    } catch (err) {
      setError('Failed to save wishes');
      console.error('Error saving wishes:', err);
    } finally {
      setLoading(false);
    }

    // Reset saved status after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Your Wish List</Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
          Share what gifts you'd like to receive. This will help your Secret Santa choose the perfect present!
        </Typography>

        {error() && (
          <Typography color="error" mb={2}>
            {error()}
          </Typography>
        )}

        <Input
          multiline
          rows={4}
          placeholder="e.g. I'd love a good book, a warm scarf, or tickets to a concert..."
          value={wishes()}
          onInput={(e: any) => setWishes(e.currentTarget.value)}
          fullWidth
        />

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading()}
          >
            {loading() ? 'Saving...' : 'Save Wishes'}
          </Button>
        </Box>

        {saved() && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography color="success.main">Wishes saved successfully!</Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default WishEditor;