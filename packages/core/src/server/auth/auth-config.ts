import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@/database';
import { ConfigService } from '../common/services';

export const getAuthConfig = (configService: ConfigService) => {
  return betterAuth({
    appName: 'Longpoint',
    database: prismaAdapter(new PrismaClient(), {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
    },
    baseURL: configService.get('baseUrl'),
    trustedOrigins: configService.get('corsOrigins'),
    secret: configService.get('authSecret'),
    telemetry: {
      enabled: false,
    },
    session: {
      cookieCache: {
        enabled: true,
      },
    },
    advanced: {
      cookiePrefix: 'longpoint',
    },
  });
};
