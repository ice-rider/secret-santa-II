import { createSignal } from 'solid-js';
import type { RegisterData } from '../types';
import authStore from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Typography } from '@suid/material';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm = (props: RegisterFormProps) => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [name, setName] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userData: RegisterData = {
      email: email(),
      password: password(),
      name: name()
    };

    const result = await authStore.register(userData.email, userData.password, userData.name);

    if (!result.success) {
      setError(result.error || 'Registration failed');
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
            <Typography variant="h4">✍️</Typography>
          </div>
        </div>
        <Typography 
          variant="h5" 
          style={{ 'text-align': 'center', 'margin-bottom': '16px' }}
        >
          Create an account
        </Typography>
        
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
            {error() && (
              <div style={{ color: 'error.main', 'text-align': 'center' }}>
                {error()}
              </div>
            )}

            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name()}
              onInput={(e: any) => setName(e.currentTarget.value)}
              required
              disabled={loading()}
            />

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
              minLength={6}
              disabled={loading()}
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={loading()}
            >
              {loading() ? 'Registering...' : 'Register'}
            </Button>
            
            <div style={{ 'text-align': 'center', 'margin-top': '16px' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={props.onSwitchToLogin}
                  disabled={loading()}
                  style={{
                    background: 'none',
                    border: 'none',
                    'text-decoration': 'underline',
                    cursor: 'pointer',
                    color: 'primary.main'
                  }}
                >
                  Login
                </button>
              </Typography>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;