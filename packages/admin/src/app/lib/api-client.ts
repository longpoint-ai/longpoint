import type { paths } from '@longpoint/types';
import createClient from 'openapi-fetch';

/**
 * Typed API client for the admin panel
 *
 * Uses openapi-fetch with auto-generated types for full type safety.
 * Types are generated from the OpenAPI spec via: npm run generate:api-types
 */
export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.DEV ? 'http://localhost:3000/api' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
