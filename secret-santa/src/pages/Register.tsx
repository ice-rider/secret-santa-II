import RegisterForm from '../auth/RegisterForm';
import OAuthButtons from '../auth/OAuthButtons';
import TelegramAuth from '../auth/TelegramAuth';

const RegisterPage = () => {
  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-form-container">
          <RegisterForm onSwitchToLogin={() => window.location.href = '/login'} />
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

export default RegisterPage;