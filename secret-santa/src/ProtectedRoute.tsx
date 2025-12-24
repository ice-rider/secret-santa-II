import { Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: any;
  fallback?: any;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Show
      when={!isLoading}
      fallback={props.fallback || <div>Loading...</div>}
    >
      <Show
        when={isAuthenticated}
        fallback={<Navigate href="/login" />}
      >
        {props.children}
      </Show>
    </Show>
  );
};

export default ProtectedRoute;