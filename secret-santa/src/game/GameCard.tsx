import type { Game } from '../types';

interface GameCardProps {
  game: Game;
}

const GameCard = (props: GameCardProps) => {
  // Function to get status badge class based on game status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div class="game-card">
      <div class="game-card-header">
        <h3 class="game-name">{props.game.name}</h3>
        <span class={`status-badge ${getStatusClass(props.game.status)}`}>
          {props.game.status.charAt(0).toUpperCase() + props.game.status.slice(1)}
        </span>
      </div>
      
      {props.game.description && (
        <p class="game-description">{props.game.description}</p>
      )}
      
      <div class="game-details">
        <div class="detail-item">
          <span class="detail-label">Creator:</span>
          <span class="detail-value">{props.game.creatorName}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">Participants:</span>
          <span class="detail-value">
            {props.game.participantCount}/{props.game.participantLimit}
          </span>
        </div>
        
        {props.game.startDate && (
          <div class="detail-item">
            <span class="detail-label">Starts:</span>
            <span class="detail-value">{formatDate(props.game.startDate)}</span>
          </div>
        )}
        
        {props.game.endDate && (
          <div class="detail-item">
            <span class="detail-label">Ends:</span>
            <span class="detail-value">{formatDate(props.game.endDate)}</span>
          </div>
        )}
      </div>
      
      <div class="game-card-footer">
        <a href={`/games/${props.game.id}`} class="view-details-link">
          View Details
        </a>
      </div>
    </div>
  );
};

export default GameCard;