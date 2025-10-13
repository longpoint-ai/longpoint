import { useAuth } from '@/auth/auth-context';
import { Spinner } from '@longpoint/ui/components/spinner';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GuardProps } from '../types';

/**
 * Require authentication for a route
 */
export function AuthGuard({ children }: GuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      const currentPath = location.pathname + location.search;
      navigate(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [session, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to /sign-in
  }

  return <>{children}</>;
}
