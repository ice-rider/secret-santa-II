// frontend/src/components/games/GameActions.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { GameDto, GameStatus } from '../../lib/api/game';
import { useApiClient } from '../../contexts/ApiContext';
import { useNotification } from '../../contexts/NotificationContext';

interface GameActionsProps {
  game: GameDto;
  onGameUpdate: () => void;
}

const GameActions: React.FC<GameActionsProps> = ({ game, onGameUpdate }) => {
  const { gameService } = useApiClient();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'start' | 'cancel' | 'finish' | null;
  }>({
    open: false,
    action: null,
  });

  const handleAction = async (action: 'start' | 'cancel' | 'finish') => {
    setLoading(true);
    try {
      switch (action) {
        case 'start':
          await gameService.startGame(game.id);
          break;
        case 'cancel':
          await gameService.cancelGame(game.id);
          break;
        case 'finish':
          await gameService.finishGame(game.id);
          break;
      }

      showNotification(`Game ${action}ed successfully!`, 'success');
      onGameUpdate();
    } catch (error: any) {
      showNotification(error.response?.data?.error || `Failed to ${action} game`, 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleConfirm = () => {
    if (confirmDialog.action) {
      handleAction(confirmDialog.action);
    }
  };

  const canStart = game.status === GameStatus.Created && (game.members?.length || 0) >= 2;
  const canCancel = game.status === GameStatus.Created;
  const canFinish = game.status === GameStatus.Started;

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      <ButtonGroup variant="contained" size="large">
        {canStart && (
          <Button
            onClick={() => setConfirmDialog({ open: true, action: 'start' })}
            disabled={loading}
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : 'Start Game'}
          </Button>
        )}
        {canCancel && (
          <Button
            onClick={() => setConfirmDialog({ open: true, action: 'cancel' })}
            disabled={loading}
            color="warning"
          >
            {loading ? <CircularProgress size={24} /> : 'Cancel Game'}
          </Button>
        )}
        {canFinish && (
          <Button
            onClick={() => setConfirmDialog({ open: true, action: 'finish' })}
            disabled={loading}
            color="success"
          >
            {loading ? <CircularProgress size={24} /> : 'Finish Game'}
          </Button>
        )}
      </ButtonGroup>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
      >
        <DialogTitle>
          Confirm {confirmDialog.action ? confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1) : ''} Game
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} this game? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, action: null })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameActions;