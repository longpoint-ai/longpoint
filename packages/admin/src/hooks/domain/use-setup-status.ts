import { useCallback, useEffect, useState } from 'react';
import { useClient } from '../common';

interface SetupStatus {
  isFirstTimeSetup: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSetupStatus(): SetupStatus {
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const client = useClient();

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await client.tools.getSetupStatus();
      setIsFirstTimeSetup(data.isFirstTimeSetup);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    isFirstTimeSetup,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
