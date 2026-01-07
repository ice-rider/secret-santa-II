import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box 
} from '@mui/material';

const GameCreationModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call an API to create the game
    console.log('Creating game:', title);
    handleClose();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Button variant="contained" onClick={handleOpen}>
        Create New Game
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Secret Santa Game</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Game Title"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default GameCreationModal;