import { createAuthClient } from 'better-auth/react';

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: import.meta.env.DEV ? 'http://localhost:3000' : undefined,
  }
);
