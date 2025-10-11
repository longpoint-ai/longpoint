import { createAuthClient } from 'better-auth/client';

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: import.meta.env.DEV ? 'http://localhost:3000' : undefined,
  }
);
