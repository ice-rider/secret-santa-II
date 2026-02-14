// frontend/src/components/games/GamePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { CopyAll as CopyIcon } from '@mui/icons-material';
import { GameDto, GameStatus } from '../../lib/api/game';
import { useApiClient } from '../../contexts/ApiContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSignalR } from '../../hooks/useSignalR';
import { useAuth } from '../../contexts/auth/AuthContext';
import MemberList from './MemberList';
import WishLetterForm from './WishLetterForm';
import GameActions from './GameActions';
import AssignmentReveal from './AssignmentReveal';
import { GameMemberDto } from '../../lib/api/game';
import AccessDenied from '../common/AccessDenied';

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gameService } = useApiClient();
  const { showNotification } = useNotification();
  const [game, setGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [assignment, setAssignment] = useState<GameMemberDto | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);

  const gameId = parseInt(id || '0', 10);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await gameService.getGameById(gameId);
      setGame(response.data);
      setAccessDenied(false); // Reset access denied flag if successful
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Navigate to login page if unauthorized
        navigate('/login');
      } else {
        showNotification(error.response?.data?.error || 'Failed to fetch game', 'error');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGameUpdate = () => {
    fetchGame();
  };

  const handleExitGame = async () => {
    try {
      await gameService.exitGame(gameId);
      showNotification('Successfully exited the game', 'info');
      navigate('/');
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to exit game', 'error');
    }
  };

  const handleGetAssignment = async () => {
    try {
      const response = await gameService.getParticipantWishLetter(gameId);
      if (response.data) {
        setAssignment(response.data);
        setShowAssignment(true);
      } else {
        showNotification('No assignment available yet', 'info');
      }
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to get assignment', 'error');
    }
  };

  const handleAssignmentComplete = () => {
    setShowAssignment(false);
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!window.confirm(`Are you sure you want to remove this member from the game?`)) {
      return;
    }

    try {
      await gameService.removeMember(gameId, memberId);
      showNotification('Member removed successfully', 'success');
      fetchGame(); // Refresh game data
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Failed to remove member', 'error');
    }
  };

  const copyGameLink = () => {
    const gameLink = `${window.location.origin}/join-game?code=${game?.code}`;
    navigator.clipboard.writeText(gameLink)
      .then(() => {
        showNotification('Game link copied to clipboard!', 'success');
      })
      .catch(err => {
        showNotification('Failed to copy game link', 'error');
        console.error('Failed to copy: ', err);
      });
  };

  useEffect(() => {
    if (isNaN(gameId)) {
      navigate('/');
      return;
    }
    fetchGame();
  }, [id]);

  useSignalR({
    gameId,
    onGameStatusUpdate: () => {
      fetchGame();
    },
    onUserJoin: () => {
      fetchGame();
    },
    onUserExit: () => {
      fetchGame();
    },
  });

  if (accessDenied) {
    return <AccessDenied message="Access denied. You need to be logged in to view this game." />;
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!game) {
    return null;
  }

  const { user } = useAuth(); // Добавляем получение текущего пользователя из контекста
  const isCurrentUserAdmin = user && game && user.id === game.adminId;
  const canManageGame = isCurrentUserAdmin && game.status === GameStatus.Created;

  return (
    <Container maxWidth="lg">
      {showAssignment && assignment && (
        <AssignmentReveal 
          recipient={assignment} 
          onComplete={handleAssignmentComplete} 
        />
      )}

      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{game.title}</Typography>
          {!isCurrentUserAdmin && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleExitGame}
            >
              Exit Game
            </Button>
          )}
        </Box>

        {game.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {game.description}
          </Typography>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Game Information
              </Typography>
              <Typography variant="body2">
                <strong>Code:</strong> {game.code}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {game.status}
              </Typography>
              <Typography variant="body2">
                <strong>Participants:</strong> {game.members?.length || 0}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={copyGameLink}
                >
                  Copy Game Link
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {isCurrentUserAdmin && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Actions
                  </Typography>
                  {game.status === GameStatus.Started && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGetAssignment}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Reveal My Assignment
                    </Button>
                  )}
                  {canManageGame && (
                    <GameActions game={game} onGameUpdate={handleGameUpdate} />
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Members" />
            <Tab label="My Wish List" />
          </Tabs>

          <Box sx={{ pt: 3 }}>
            {activeTab === 0 && (
              <MemberList
                members={game.members || []}
                isAdmin={isCurrentUserAdmin || false}
                currentUserId={user?.id}
                onRemoveMember={isCurrentUserAdmin ? handleRemoveMember : undefined}
              />
            )}
            {activeTab === 1 && (
              <WishLetterForm
                gameId={game.id}
                initialLetter={""} // Get initial letter if available
                disabled={game.status !== GameStatus.Created && game.status !== GameStatus.Started}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default GamePage;