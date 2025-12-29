import { createSignal } from 'solid-js';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Box, Typography } from '@suid/material';

interface AssignmentRevealProps {
  gameId: string;
  isGameStarted: boolean;
}

const AssignmentReveal = (props: AssignmentRevealProps) => {
  const [assignment, setAssignment] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [revealed, setRevealed] = createSignal(false);

  const revealAssignment = async () => {
    setLoading(true);

    // In a real implementation, you would fetch the assignment from the backend
    // const assignment = await gamesService.getAssignment(props.gameId);
    // setAssignment(assignment);

    // For demo purposes, we'll use a placeholder
    setTimeout(() => {
      setAssignment('Alex Johnson');
      setRevealed(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card>
      <Box component="div" p={3} textAlign="center">
        <Typography variant="h6" mb={2}>Your Secret Santa Assignment</Typography>

        {!revealed() ? (
          <Box component="div">
            <Typography variant="body1" color="textSecondary" mb={3}>
              Your Secret Santa assignment is ready! Click the button below to reveal who you'll be giving a gift to.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={revealAssignment}
              disabled={loading() || !props.isGameStarted}
            >
              {loading() ? 'Revealing...' : 'Reveal My Assignment'}
            </Button>

            {!props.isGameStarted && (
              <Typography color="textSecondary" mt={2}>
                The game hasn't started yet. Please wait for the creator to start the game.
              </Typography>
            )}
          </Box>
        ) : (
          <Box component="div">
            <Typography variant="h4" color="primary" mb={2}>
              🎁 {assignment()} 🎁
            </Typography>
            <Typography variant="body1" color="textSecondary">
              This is the person you'll be giving a gift to! Remember to keep it a secret. 🤫
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default AssignmentReveal;