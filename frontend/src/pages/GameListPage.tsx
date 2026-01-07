import React from 'react';
import GameList from '../components/games/GameList';
import GameCreationModal from '../components/games/GameCreationModal';

const GameListPage: React.FC = () => {
  return (
    <div>
      <h1>My Games</h1>
      <GameCreationModal />
      <GameList />
    </div>
  );
};

export default GameListPage;