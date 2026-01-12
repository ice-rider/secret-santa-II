// frontend/src/components/games/GameStatusBadge.tsx
import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { GameStatus } from '../../lib/api/game';

interface GameStatusBadgeProps {
  status: GameStatus;
  size?: 'small' | 'medium';
}

const getStatusConfig = (status: GameStatus): {
  label: string;
  color: ChipProps['color'];
} => {
  switch (status) {
    case GameStatus.Created:
      return {
        label: 'Created',
        color: 'default',
      };
    case GameStatus.Started:
      return {
        label: 'In Progress',
        color: 'secondary',
      };
    case GameStatus.Cancelled:
      return {
        label: 'Cancelled',
        color: 'error',
      };
    case GameStatus.Finished:
      return {
        label: 'Finished',
        color: 'success',
      };
    default:
      return {
        label: 'Unknown',
        color: 'default',
      };
  }
};

const GameStatusBadge: React.FC<GameStatusBadgeProps> = ({ status, size = 'medium' }) => {
  const { label, color } = getStatusConfig(status);

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="outlined"
    />
  );
};

export default GameStatusBadge;