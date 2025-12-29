import type { Game } from '../types';
import { A } from '@solidjs/router';
import { Card, CardContent, CardActions } from '@suid/material';
import { Button } from '../components/ui/Button';
import { Box, Typography, Chip } from '@suid/material';

interface GameCardProps {
  game: Game;
}

const GameCard = (props: GameCardProps) => {
  // Function to get status color based on game status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString!).toLocaleDateString();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" noWrap>
            {props.game.name}
          </Typography>
          <Chip
            label={props.game.status.charAt(0).toUpperCase() + props.game.status.slice(1)}
            size="small"
            color={getStatusColor(props.game.status) as any}
            variant="outlined"
          />
        </Box>

        {props.game.description && (
          <Typography variant="body2" color="textSecondary" mb={2} sx={{ minHeight: '48px' }}>
            {props.game.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1', minWidth: '120px' }}>
            <Typography variant="caption" color="textSecondary">Creator</Typography>
            <Typography variant="body2">{props.game.creatorName}</Typography>
          </Box>

          <Box sx={{ flex: '1', minWidth: '120px' }}>
            <Typography variant="caption" color="textSecondary">Participants</Typography>
            <Typography variant="body2">
              {props.game.participantCount}/{props.game.participantLimit}
            </Typography>
          </Box>

          {props.game.startDate && (
            <Box sx={{ flex: '1', minWidth: '120px' }}>
              <Typography variant="caption" color="textSecondary">Starts</Typography>
              <Typography variant="body2">{formatDate(props.game.startDate)}</Typography>
            </Box>
          )}

          {props.game.endDate && (
            <Box sx={{ flex: '1', minWidth: '120px' }}>
              <Typography variant="caption" color="textSecondary">Ends</Typography>
              <Typography variant="body2">{formatDate(props.game.endDate)}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <A href={`/games/${props.game.id}`} style={{ "text-decoration": 'none', width: '100%' }}>
          <Button variant="outlined" fullWidth>
            View Details
          </Button>
        </A>
      </CardActions>
    </Card>
  );
};

export default GameCard;