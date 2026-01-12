// frontend/src/components/games/AssignmentReveal.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Grow } from '@mui/material';
import { CardGiftcard as GiftIcon } from '@mui/icons-material';
import Confetti from 'react-confetti';
import { GameMemberDto } from '../../lib/api/game';

interface AssignmentRevealProps {
  recipient: GameMemberDto;
  onComplete?: () => void;
}

const AssignmentReveal: React.FC<AssignmentRevealProps> = ({ recipient, onComplete }) => {
  const [stage, setStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500);
    const timer2 = setTimeout(() => setStage(2), 1500);
    const timer3 = setTimeout(() => {
      setStage(3);
      setShowConfetti(true);
    }, 2500);
    const timer4 = setTimeout(() => {
      setShowConfetti(false);
      if (onComplete) onComplete();
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
      }}
    >
      {showConfetti && <Confetti />}

      <Box sx={{ textAlign: 'center', maxWidth: 600, px: 3 }}>
        <Fade in={stage >= 1} timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <GiftIcon sx={{ fontSize: 80, color: 'primary.main' }} />
          </Box>
        </Fade>

        <Fade in={stage >= 2} timeout={1000}>
          <Typography variant="h4" sx={{ color: 'white', mb: 3 }}>
            🎅 You are Secret Santa for...
          </Typography>
        </Fade>

        <Grow in={stage >= 3} timeout={1000}>
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              {recipient.user.name}
            </Typography>
            {recipient.letter && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Their Wish:
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {recipient.letter}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grow>
      </Box>
    </Box>
  );
};

export default AssignmentReveal;