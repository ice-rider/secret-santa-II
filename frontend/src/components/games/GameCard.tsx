import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'completed';
  participantCount: number;
  createdAt: string;
}

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'primary';
      case 'draft': return 'default';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="h3">
              {game.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(game.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={game.status.charAt(0).toUpperCase() + game.status.slice(1)} 
              color={getStatusColor(game.status) as any}
              size="small"
            />
            <Typography variant="body2">
              {game.participantCount} {game.participantCount === 1 ? 'participant' : 'participants'}
            </Typography>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => navigate(`/games/${game.id}`)}
            >
              View
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GameCard;