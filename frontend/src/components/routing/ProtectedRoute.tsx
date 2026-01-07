import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If the user is loading, show a loading indicator
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If the user is not authenticated, redirect to the fallback path
  if (!isAuthenticated) {
    // Store the current location to redirect back after login
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;