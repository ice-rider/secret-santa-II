import { lazy } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import { AuthProvider } from './AuthProvider';
import ProtectedRoute from './ProtectedRoute';

// Lazy load pages to improve initial load time
const HomePage = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const OAuthCallbackPage = lazy(() => import('./auth/OAuthCallback'));

const AppRoutes = () => {
  return (
    <Router root={AuthProvider}>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/oauth/callback" component={OAuthCallbackPage} />

      {/* Protected routes */}
      <Route path="/dashboard" component={() => (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      )} />
      <Route path="/profile" component={() => (
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      )} />
    </Router>
  );
};

export default AppRoutes;