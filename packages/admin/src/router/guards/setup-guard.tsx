import { useSetupStatus } from '@/hooks/domain/use-setup-status';
import { Spinner } from '@longpoint/ui/components/spinner';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuardProps } from '../types';

/**
 * First-time setup protection
 */
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
