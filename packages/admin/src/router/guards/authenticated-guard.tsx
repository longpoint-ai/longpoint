import { useAuth } from '@/auth/auth-context';
import { Spinner } from '@longpoint/ui/components/spinner';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GuardProps } from '../types';

/**
 * Require no authentication for a route
 */
export function AuthenticatedGuard({ children }: GuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      // Check if there's a redirect parameter, otherwise go to home
      const urlParams = new URLSearchParams(location.search);
      const redirectTo = urlParams.get('redirect') || '/';
      navigate(redirectTo);
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

  if (session) {
    return null; // Will redirect to home or redirect param
  }

  return <>{children}</>;
}
