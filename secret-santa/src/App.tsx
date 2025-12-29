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
const GamesListPage = lazy(() => import('./game/GamesListPage'));
const GameDetailsPage = lazy(() => import('./game/GameDetailsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPagee'));

const App = () => {
  return (
    <AuthProvider>
      <Router>
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
        <Route path="/games" component={() => (
          <ProtectedRoute>
            <GamesListPage />
          </ProtectedRoute>
        )} />
        <Route path="/games/:id" component={() => (
          <ProtectedRoute>
            <GameDetailsPage />
          </ProtectedRoute>
        )} />

        {/* 404 route - must be last */}
        <Route path="*404" component={NotFoundPage} />
      </Router>
    </AuthProvider>
  );
};

export default App;