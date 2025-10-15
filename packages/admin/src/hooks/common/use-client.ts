import { useAuth } from '@/auth';
import { Longpoint } from '@longpoint/sdk';
import { useMemo } from 'react';

export function useClient() {
  const { session } = useAuth();

  const client = useMemo(() => {
    return new Longpoint({
      baseUrl: import.meta.env.DEV ? 'http://localhost:3000/api' : '/api',
      apiKey: session ? `sess_${session.session.token}` : undefined,
    });
  }, [session]);

  return client;
}
