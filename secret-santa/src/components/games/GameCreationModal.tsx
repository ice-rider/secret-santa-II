// frontend/src/components/games/GameCreationModal.tsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useApiClient } from '../../contexts/ApiContext';
import { useNotification } from '../../contexts/NotificationContext';

interface GameCreationModalProps {
  onSuccess?: () => void;
}

const GameCreationModal: React.FC<GameCreationModalProps> = ({ onSuccess }) => {
  const { gameService } = useApiClient();
  const { showNotification } = useNotification();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isAdminParticipating: true,
  });

  const handleOpen = () => {
    setOpen(true);
    setFormData({
      title: '',
      description: '',
      isAdminParticipating: true,
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showNotification('Please enter a game title', 'error');
      return;
    }

    setLoading(true);
    try {
      await gameService.createGame({
        title: formData.title,
        description: formData.description || undefined,
        isAdminParticipating: formData.isAdminParticipating,
      });
      showNotification('Game created successfully!', 'success');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to create game', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        Create New Game
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create Secret Santa Game</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Game Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="isAdminParticipating"
                  checked={formData.isAdminParticipating}
                  onChange={handleChange}
                />
              }
              label="Participate as admin (be included in gift exchange)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Game'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameCreationModal;