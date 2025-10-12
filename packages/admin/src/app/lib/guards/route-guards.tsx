import { Spinner } from '@longpoint/ui/components/spinner';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import { useSetupStatus } from '../hooks/use-setup-status';

interface GuardProps {
  children: React.ReactNode;
}

export function SetupGuard({ children }: GuardProps) {
  const navigate = useNavigate();
  const { isFirstTimeSetup, isLoading } = useSetupStatus();

  useEffect(() => {
    if (!isLoading && isFirstTimeSetup) {
      navigate('/setup');
    }
  }, [isFirstTimeSetup, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Spinner />
          <span className="text-muted-foreground">
            Checking setup status...
          </span>
        </div>
      </div>
    );
  }

  if (isFirstTimeSetup) {
    return null; // Will redirect to /setup
  }

  return <>{children}</>;
}

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
          <span className="text-muted-foreground">
            Checking authentication...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to /sign-in
  }

  return <>{children}</>;
}

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
          <span className="text-muted-foreground">
            Checking authentication...
          </span>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to home or redirect param
  }

  return <>{children}</>;
}

export function SetupCompleteGuard({ children }: GuardProps) {
  const navigate = useNavigate();
  const { isFirstTimeSetup, isLoading } = useSetupStatus();

  useEffect(() => {
    if (!isLoading && !isFirstTimeSetup) {
      navigate('/');
    }
  }, [isFirstTimeSetup, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Spinner />
          <span className="text-muted-foreground">
            Checking setup status...
          </span>
        </div>
      </div>
    );
  }

  if (!isFirstTimeSetup) {
    return null; // Will redirect to home
  }

  return <>{children}</>;
}
