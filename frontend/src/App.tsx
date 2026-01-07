import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext';
import { AuthProvider } from './contexts/auth/AuthContext';
import { useApiClient } from './contexts/ApiContext';
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import GameListPage from './pages/GameListPage';
import GameDetailPage from './pages/GameDetailPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import './App.css';

// Wrapper component to access ApiClient in AuthProvider
const AppContent: React.FC = () => {
  const { apiClient, authService } = useApiClient();

  return (
    <AuthProvider apiClient={apiClient} authService={authService}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white p-4">
          <h1 className="text-2xl font-bold text-center">Secret Santa</h1>
        </header>
        <main className="container mx-auto p-4 max-w-4xl">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <GameListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/:id"
              element={
                <ProtectedRoute>
                  <GameDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/games" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

function App() {
  return (
    <Router>
      <ApiProvider>
        <AppContent />
      </ApiProvider>
    </Router>
  );
}

export default App;
