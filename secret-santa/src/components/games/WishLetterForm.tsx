// frontend/src/components/games/WishLetterForm.tsx
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Paper, Typography } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useApiClient } from '../../contexts/ApiContext';
import { useNotification } from '../../contexts/NotificationContext';

interface WishLetterFormProps {
  gameId: number;
  initialLetter?: string;
  disabled?: boolean;
}

const WishLetterForm: React.FC<WishLetterFormProps> = ({ gameId, initialLetter = '', disabled = false }) => {
  const { gameService } = useApiClient();
  const { showNotification } = useNotification();
  const [letter, setLetter] = useState(initialLetter);
  const [isEditing, setIsEditing] = useState(!initialLetter);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLetter(initialLetter);
  }, [initialLetter]);

  const handleSave = async () => {
    if (!letter.trim()) {
      showNotification('Wish letter cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      await gameService.changeWishLetter(gameId, letter);
      showNotification('Wish letter saved!', 'success');
      setIsEditing(false);
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to save wish letter', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Your Wish List</Typography>
        {!disabled && !isEditing && (
          <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)} size="small">
            Edit
          </Button>
        )}
      </Box>

      {isEditing && !disabled ? (
        <Box>
          <TextField
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="What would you like for Christmas?"
            multiline
            rows={4}
            fullWidth
            inputProps={{ maxLength: 256 }}
            helperText={`${letter.length}/256 characters`}
            disabled={loading}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={loading || !letter.trim()}
            >
              Save
            </Button>
            {initialLetter && (
              <Button
                onClick={() => {
                  setLetter(initialLetter);
                  setIsEditing(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {letter || 'No wish list yet'}
        </Typography>
      )}
    </Paper>
  );
};

export default WishLetterForm;