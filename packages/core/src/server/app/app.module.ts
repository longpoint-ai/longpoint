import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER } from '@nestjs/core';
import { CommonModule } from '../common/common.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { ConfigService } from '../common/services';
import { getStaticModule } from './load-static.utils';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [CommonModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          pinoHttp: {
            customProps: (req, res) => ({
              context: 'HTTP',
            }),
            level: configService.get('logLevel'),
            messageKey:
              configService.get('nodeEnv') === 'development'
                ? 'msg'
                : 'message',
            formatters: {
              level: (label, number) => {
                return {
                  severity: label.toUpperCase(),
                  level: number,
                };
              },
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
                'req.remoteAddress',
                'req.remotePort',
                'req.body.password',
                'req.body.token',
                'req.body.accessToken',
                'req.body.refreshToken',
              ],
              remove: true,
            },
            transport:
              configService.get('nodeEnv') === 'development'
                ? {
                    target: 'pino-pretty',
                    options: { singleLine: true },
                  }
                : undefined,
          },
        };
      },
    }),
    getStaticModule(),
    CommonModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
