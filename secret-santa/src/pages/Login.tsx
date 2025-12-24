import { createSignal } from 'solid-js';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import OAuthButtons from '../auth/OAuthButtons';
import TelegramAuth from '../auth/TelegramAuth';

const LoginPage = () => {
  const [isLoginView, setIsLoginView] = createSignal(true);

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-container">
          {isLoginView() ? (
            <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
          )}
        </div>
        
        <div class="auth-separator">
          <span>or</span>
        </div>
        
        <div class="auth-providers">
          <OAuthButtons />
          <TelegramAuth />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;