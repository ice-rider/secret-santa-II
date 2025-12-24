import { createSignal } from 'solid-js';
import type { RegisterData } from '../types';
import authStore from '../stores/auth.store';

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
    <form onSubmit={handleSubmit} class="auth-form">
      <h2>Create Account</h2>
      
      {error() && (
        <div class="error-message">
          {error()}
        </div>
      )}
      
      <div class="form-group">
        <label for="name">Name</label>
        <input
          id="name"
          type="text"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          required
          disabled={loading()}
        />
      </div>
      
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
          minLength={6}
          disabled={loading()}
        />
      </div>
      
      <button type="submit" disabled={loading()}>
        {loading() ? 'Registering...' : 'Register'}
      </button>
      
      <p class="auth-switch-link">
        Already have an account?{' '}
        <button type="button" onClick={props.onSwitchToLogin} disabled={loading()}>
          Login
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;