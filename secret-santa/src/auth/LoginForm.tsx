import { createSignal } from 'solid-js';
import type { LoginCredentials } from '../types';
import authStore from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Typography } from '@suid/material';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm = (props: LoginFormProps) => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const credentials: LoginCredentials = {
      email: email(),
      password: password()
    };

    const result = await authStore.login(credentials.email, credentials.password);

    if (!result.success) {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div class="auth-container" style={{ 
      display: 'flex', 
      'justify-content': 'center', 
      'align-items': 'center', 
      height: '100vh',
      'background-color': '#f5f5f5'
    }}>
      <Card sx={{ maxWidth: '400px', margin: '0 auto', boxShadow: 3 }}>
        <div style={{ 
          display: 'flex', 
          'justify-content': 'center', 
          'margin-bottom': '16px' 
        }}>
          <div style={{ 
            'background-color': 'primary.main',
            width: '48px',
            height: '48px',
            'border-radius': '50%',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }}>
            <Typography variant="h4">🔐</Typography>
          </div>
        </div>
        <Typography 
          variant="h5" 
          style={{ 'text-align': 'center', 'margin-bottom': '16px' }}
        >
          Login to your account
        </Typography>
        
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
            {error() && (
              <div style={{ color: 'error.main', 'text-align': 'center' }}>
                {error()}
              </div>
            )}

            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email()}
              onInput={(e: any) => setEmail(e.currentTarget.value)}
              required
              disabled={loading()}
            />

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password()}
              onInput={(e: any) => setPassword(e.currentTarget.value)}
              required
              disabled={loading()}
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={loading()}
            >
              {loading() ? 'Logging in...' : 'Login'}
            </Button>
            
            <div style={{ 'text-align': 'center', 'margin-top': '16px' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={props.onSwitchToRegister}
                  disabled={loading()}
                  style={{
                    background: 'none',
                    border: 'none',
                    'text-decoration': 'underline',
                    cursor: 'pointer',
                    color: 'primary.main'
                  }}
                >
                  Register
                </button>
              </Typography>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;