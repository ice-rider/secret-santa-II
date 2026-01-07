import React from 'react';
import { useParams } from 'react-router-dom';

const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Game Details: {id}</h1>
      <p>Game details will be displayed here.</p>
    </div>
  );
};

export default GameDetailPage;