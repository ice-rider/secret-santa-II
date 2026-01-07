import React, { useState } from 'react';
import GameCard from './GameCard';
import { Box, Tabs, Tab } from '@mui/material';

interface Game {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'completed';
  participantCount: number;
  createdAt: string;
  isCreator: boolean;
  isParticipant: boolean;
}

const GameList: React.FC = () => {
  // Mock data for now
  const allGames: Game[] = [
    { id: '1', title: 'Christmas 2023', status: 'active', participantCount: 6, createdAt: '2023-11-01', isCreator: true, isParticipant: true },
    { id: '2', title: 'Office Secret Santa', status: 'draft', participantCount: 0, createdAt: '2023-11-15', isCreator: true, isParticipant: true },
    { id: '3', title: 'Family Exchange', status: 'completed', participantCount: 8, createdAt: '2023-10-20', isCreator: false, isParticipant: true },
    { id: '4', title: 'Friends Group', status: 'active', participantCount: 5, createdAt: '2023-12-01', isCreator: false, isParticipant: true },
  ];

  const [filter, setFilter] = useState<'all' | 'created' | 'participating'>('all');

  // Filter games based on the selected filter
  const filteredGames = allGames.filter(game => {
    if (filter === 'created') {
      return game.isCreator;
    } else if (filter === 'participating') {
      return game.isParticipant && !game.isCreator;
    }
    return true; // 'all' filter
  });

  const handleFilterChange = (event: React.SyntheticEvent, newValue: 'all' | 'created' | 'participating') => {
    setFilter(newValue);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filter} onChange={handleFilterChange}>
          <Tab value="all" label="All Games" />
          <Tab value="created" label="Created by Me" />
          <Tab value="participating" label="Participating" />
        </Tabs>
      </Box>

      {filteredGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </Box>
  );
};

export default GameList;