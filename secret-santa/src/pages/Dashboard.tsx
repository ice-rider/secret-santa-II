import { createSignal, onMount, For } from 'solid-js';
import { A } from '@solidjs/router';
import { useAuth } from '../AuthProvider';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Typography, Grid, Stack } from '@suid/material';
import type { Game } from '../types';
import gamesService from '../services/games.service';

const DashboardPage = () => {
  const auth = useAuth();
  const [games, setGames] = createSignal<Game[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      // Load user's games
      const userGames = await gamesService.getGames({ type: 'participating' });
      setGames(userGames);
    } catch (err) {
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div style={{
      'min-height': '100vh',
      'background': 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        'justify-content': 'space-between', 
        'align-items': 'center', 
        padding: '24px'
      }}>
        <Typography variant="h5" component="h1">Dashboard</Typography>
        <nav>
          <Stack direction="row" spacing={2} alignItems="center">
            <A href="/" style={{ color: 'inherit', 'text-decoration': 'none' }}>
              Home
            </A>
            <A href="/profile" style={{ color: 'inherit', 'text-decoration': 'none' }}>
              Profile
            </A>
            <Button variant="outlined" onClick={auth.logout}>
              Logout
            </Button>
          </Stack>
        </nav>
      </header>

      <div style={{ 'padding': '32px 24px', 'max-width': '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ 'margin-bottom': '48px', 'text-align': 'center' }}>
          <Typography variant="h4" component="h2" style={{ 'margin-bottom': '8px' }}>
            Hello, {auth.user?.name || auth.user?.email}!
          </Typography>
          <Typography color="textSecondary">
            Welcome to your Secret Santa dashboard. Manage your events and see your assignments.
          </Typography>
        </div>

        {/* Dashboard Actions */}
        <Grid container spacing={24} style={{ 'max-width': '1200px', 'margin': '0 auto', 'margin-bottom': '48px' }}>
          <div style={{ 'padding': '0 8px' }}>
            <Card style={{
              'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              'transition': 'box-shadow 0.3s',
              'margin-bottom': '24px'
            }}>
              <div style={{ 'padding': '24px' }}>
                <Typography variant="h6" style={{ 'margin-bottom': '8px' }}>Create Event</Typography>
                <Typography variant="body2" color="textSecondary" style={{ 'margin-bottom': '16px' }}>
                  Start a new Secret Santa event
                </Typography>
                <A href="/games" style={{ 'text-decoration': 'none', 'display': 'block' }}>
                  <Button fullWidth>
                    Create Event
                  </Button>
                </A>
              </div>
            </Card>
          </div>

          <div style={{ 'padding': '0 8px' }}>
            <Card style={{
              'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              'transition': 'box-shadow 0.3s',
              'margin-bottom': '24px'
            }}>
              <div style={{ 'padding': '24px' }}>
                <Typography variant="h6" style={{ 'margin-bottom': '8px' }}>Join Event</Typography>
                <Typography variant="body2" color="textSecondary" style={{ 'margin-bottom': '16px' }}>
                  Join an existing Secret Santa event
                </Typography>
                <A href="/games" style={{ 'text-decoration': 'none', 'display': 'block' }}>
                  <Button fullWidth>
                    Join Event
                  </Button>
                </A>
              </div>
            </Card>
          </div>

          <div style={{ 'padding': '0 8px' }}>
            <Card style={{
              'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              'transition': 'box-shadow 0.3s',
              'margin-bottom': '24px'
            }}>
              <div style={{ 'padding': '24px' }}>
                <Typography variant="h6" style={{ 'margin-bottom': '8px' }}>Your Events</Typography>
                <Typography variant="body2" color="textSecondary" style={{ 'margin-bottom': '16px' }}>
                  Manage your Secret Santa events
                </Typography>
                <A href="/games" style={{ 'text-decoration': 'none', 'display': 'block' }}>
                  <Button variant="outlined" fullWidth>
                    View Events
                  </Button>
                </A>
              </div>
            </Card>
          </div>
        </Grid>

        {/* Recent Events Section */}
        <div style={{ 'margin-top': '48px', 'max-width': '1200px', 'margin': '0 auto' }}>
          <Typography variant="h5" component="h3" style={{ 'margin-bottom': '24px' }}>Your Events</Typography>
          {loading() ? (
            <div style={{ 
              display: 'flex', 
              'justify-content': 'center', 
              'align-items': 'center', 
              height: '200px' 
            }}>
              <Typography>Loading events...</Typography>
            </div>
          ) : games().length > 0 ? (
            <Grid container spacing={16}>
              <For each={games()}>
                {(game) => (
                  <div style={{ 'padding': '0 8px' }}>
                    <Card style={{ 'margin-bottom': '24px' }}>
                      <div style={{ 'padding': '24px' }}>
                        <Typography variant="h6" style={{ 'margin-bottom': '8px' }}>{game.name}</Typography>
                        <Typography variant="body2" color="textSecondary" style={{ 'margin-bottom': '16px' }}>
                          {game.description || 'No description'}
                        </Typography>
                        <div style={{
                          display: 'flex',
                          'justify-content': 'space-between',
                          'align-items': 'center'
                        }}>
                          <Typography variant="caption" color="textSecondary">
                            {game.participantCount} / {game.participantLimit} participants
                          </Typography>
                          <A href={`/games/${game.id}`} style={{ 'text-decoration': 'none' }}>
                            <Button size="small">View Details</Button>
                          </A>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </For>
            </Grid>
          ) : (
            <Card style={{ 'margin-bottom': '24px' }}>
              <div style={{ 'padding': '48px', 'text-align': 'center' }}>
                <Typography color="textSecondary">You haven't joined any events yet. Create or join your first Secret Santa event!</Typography>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;