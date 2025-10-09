import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {
  CommonApiServicesModule,
  ConfigService,
} from '@longpoint/api-services';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [CommonApiServicesModule],
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    CommonApiServicesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
