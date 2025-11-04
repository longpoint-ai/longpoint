import { Logger } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { ConfigService, PrismaService } from '../common/services';

export const getAuthConfig = (
  configService: ConfigService,
  prismaService: PrismaService,
  logger: Logger
) => {
  return betterAuth({
    appName: 'Longpoint',
    database: prismaAdapter(prismaService, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
    },
    baseURL: configService.get('server.origin'), // better-auth expects the origin, not including the path
    trustedOrigins: configService.get('server.corsOrigins'),
    secret: configService.get('auth.secret'),
    telemetry: {
      enabled: false,
    },
    // session: {
    //   cookieCache: {
    //     enabled: true,
    //   },
    // },
    advanced: {
      cookiePrefix: 'longpoint',
    },
    hooks: {
      after: signUpMiddleware(prismaService),
    },
    logger: {
      log(level, message, ...args) {
        switch (level) {
          case 'error':
            logger.error(message, ...args);
            break;
          case 'warn':
            logger.warn(message, ...args);
            break;
          case 'info':
            logger.log(message, ...args);
            break;
          case 'debug':
            logger.debug(message, ...args);
            break;
          default:
            logger.log(message, ...args);
            break;
        }
      },
    },
  });
};

function signUpMiddleware(prismaService: PrismaService) {
  return createAuthMiddleware(async (ctx) => {
    const isSignUp = ctx.path.startsWith('/sign-up');
    const newSession = ctx.context.newSession;
    if (isSignUp && newSession) {
      const userCount = await prismaService.user.count();
      if (userCount === 1) {
        const superAdminRole = await prismaService.role.findFirst({
          where: {
            name: {
              equals: 'Super Admin',
              mode: 'insensitive',
            },
          },
        });
        if (!superAdminRole) {
          throw new Error('Expected Super Admin role - not found');
        }
        await prismaService.userRole.create({
          data: {
            roleId: superAdminRole.id,
            userId: newSession.user.id,
          },
        });
      }
    }
  });
}
