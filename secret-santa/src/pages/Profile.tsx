import { createSignal, onMount } from 'solid-js';
import { useAuth } from '../AuthProvider';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Box, Typography } from '@suid/material';

const ProfilePage = () => {
  const auth = useAuth();
  const [name, setName] = createSignal(auth.user?.name || '');
  const [email, setEmail] = createSignal(auth.user?.email || '');
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);

  onMount(() => {
    // Initialize form with user data
    setName(auth.user?.name || '');
    setEmail(auth.user?.email || '');
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // In a real implementation, you would update the user profile via API
      // await updateProfile({ name: name(), email: email() });
      
      // Update local state
      auth.updateUser({ name: name(), email: email() });
      
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))'
      }}
    >
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 6 }}>
        <Typography variant="h5" component="h1">Profile</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Card sx={{ maxWidth: '600px', width: '100%', mt: 4 }}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" mb={3}>Update Profile</Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Input
                  label="Name"
                  value={name()}
                  onInput={(e: any) => setName(e.currentTarget.value)}
                  required
                  disabled={loading()}
                />

                <Input
                  label="Email"
                  type="email"
                  value={email()}
                  onInput={(e: any) => setEmail(e.currentTarget.value)}
                  required
                  disabled={loading()}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading()}
                  >
                    {loading() ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>

                {success() && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography color="success.main">Profile updated successfully!</Typography>
                  </Box>
                )}
              </Box>
            </form>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default ProfilePage;