// frontend/src/components/games/JoinGameModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import { useApiClient } from '../../contexts/ApiContext';
import { useNotification } from '../../contexts/NotificationContext';

interface JoinGameModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JoinGameModal: React.FC<JoinGameModalProps> = ({ open, onClose, onSuccess }) => {
  const { gameService } = useApiClient();
  const { showNotification } = useNotification();
  const [gameCode, setGameCode] = useState('');
  const [wishLetter, setWishLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!gameCode.trim()) {
      showNotification('Please enter a game code', 'error');
      return;
    }

    setLoading(true);
    try {
      await gameService.joinGame(gameCode.toUpperCase(), wishLetter || undefined);
      showNotification('Successfully joined the game!', 'success');
      setGameCode('');
      setWishLetter('');
      onSuccess();
      onClose();
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to join game', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Join Secret Santa Game</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Game Code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            inputProps={{ maxLength: 6, style: { textTransform: 'uppercase' } }}
            fullWidth
            required
          />
          <TextField
            label="Your Wish List (Optional)"
            value={wishLetter}
            onChange={(e) => setWishLetter(e.target.value)}
            placeholder="What would you like for Christmas?"
            multiline
            rows={4}
            inputProps={{ maxLength: 256 }}
            helperText={`${wishLetter.length}/256 characters`}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleJoin}
          variant="contained"
          disabled={loading || !gameCode.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Join Game'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinGameModal;