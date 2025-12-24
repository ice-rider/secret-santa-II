import { createSignal } from 'solid-js';
import type { LoginCredentials } from '../types';
import authStore from '../stores/auth.store';

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
    <form onSubmit={handleSubmit} class="auth-form">
      <h2>Login</h2>
      
      {error() && (
        <div class="error-message">
          {error()}
        </div>
      )}
      
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
          required
          disabled={loading()}
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          required
          disabled={loading()}
        />
      </div>
      
      <button type="submit" disabled={loading()}>
        {loading() ? 'Logging in...' : 'Login'}
      </button>
      
      <p class="auth-switch-link">
        Don't have an account?{' '}
        <button type="button" onClick={props.onSwitchToRegister} disabled={loading()}>
          Register
        </button>
      </p>
    </form>
  );
};

export default LoginForm;