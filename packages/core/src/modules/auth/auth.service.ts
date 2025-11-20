import { Injectable, Logger } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { toNodeHandler } from 'better-auth/node';
import { Request, Response } from 'express';
import { ConfigService, PrismaService } from '../common/services';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly betterAuth: ReturnType<typeof betterAuth>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    this.betterAuth = this.initializeBetterAuth();
  }

  handleAuthRequest(req: Request, res: Response) {
    return toNodeHandler(this.betterAuth)(req, res);
  }

  private initializeBetterAuth() {
    const logger = this.logger;
    return betterAuth({
      appName: 'Longpoint',

      database: prismaAdapter(this.prismaService, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
        disableSignUp: true,
      },

      baseURL: this.configService.get('server.origin'), // better-auth expects the origin, not including the path
      trustedOrigins: this.configService.get('server.corsOrigins'),
      secret: this.configService.get('auth.secret'),
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
        after: createAuthMiddleware(async (ctx) => {
          const isSignUp = ctx.path.startsWith('/sign-up');
          const newSession = ctx.context.newSession;
          if (isSignUp && newSession) {
            const userCount = await this.prismaService.user.count();
            if (userCount === 1) {
              const superAdminRole = await this.prismaService.role.findFirst({
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
              await this.prismaService.userRole.create({
                data: {
                  roleId: superAdminRole.id,
                  userId: newSession.user.id,
                },
              });
            }
          }
        }),
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
  }
}
