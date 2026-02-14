// frontend/src/components/games/GameCard.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { GameDto, GameStatus } from '../../lib/api/game';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: GameDto;
}

const getStatusColor = (status: GameStatus) => {
  switch (status) {
    case GameStatus.Created:
      return 'default';
    case GameStatus.Started:
      return 'secondary';
    case GameStatus.Cancelled:
      return 'error';
    case GameStatus.Finished:
      return 'success';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: GameStatus) => {
  switch (status) {
    case GameStatus.Created:
      return 'Created';
    case GameStatus.Started:
      return 'Started';
    case GameStatus.Cancelled:
      return 'Cancelled';
    case GameStatus.Finished:
      return 'Finished';
    default:
      return 'Unknown';
  }
};

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/games/${game.id}`);
  };

  return (
    <Card>
      <CardHeader
        title={game.title}
        subheader={`Code: ${game.code}`}
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {game.title.charAt(0).toUpperCase()}
          </Avatar>
        }
      />
      <CardContent>
        {game.description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {game.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <Chip
            label={getStatusLabel(game.status)}
            color={getStatusColor(game.status) as 'default' | 'secondary' | 'error' | 'success'}
            size="small"
          />
          <Chip
            label={`${game.members?.length || 0} participant${(game.members?.length || 0) !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default GameCard;