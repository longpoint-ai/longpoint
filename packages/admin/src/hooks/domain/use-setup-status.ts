import { apiClient } from '@/api';
import { useCallback, useEffect, useState } from 'react';

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

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await apiClient.GET('/setup/status');
      if (apiError) {
        throw new Error('Failed to fetch setup status');
      }
      setIsFirstTimeSetup(data?.isFirstTimeSetup ?? true);
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
