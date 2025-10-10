import {
  Logger,
  RequestMethod,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from './common/services';
import helmet from 'helmet';
import { LoggerErrorInterceptor, Logger as PinoLogger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { InvalidInput } from './common/errors/invalid-input.error.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  const nodeEnv = configService.get('nodeEnv');

  // ------------------------------------------------------------
  // Security headers
  // ------------------------------------------------------------
  app.use(
    helmet({
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Needed for Swagger UI
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for HLS streaming compatibility
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for HLS
      noSniff: true,
      hidePoweredBy: true,
      ieNoOpen: true,
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
    })
  );

  // ------------------------------------------------------------
  // Logger
  // ------------------------------------------------------------
  app.useLogger(app.get(PinoLogger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // ------------------------------------------------------------
  // Pipes
  // ------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const extractAllConstraintMessages = (
          validationErrors: ValidationError[]
        ): string[] => {
          return validationErrors.flatMap((error) => {
            const messages: string[] = [];

            if (error.constraints) {
              messages.push(...Object.values(error.constraints));
            }

            if (error.children && error.children.length > 0) {
              messages.push(...extractAllConstraintMessages(error.children));
            }

            return messages;
          });
        };
        const messages = extractAllConstraintMessages(errors);
        return new InvalidInput(messages);
      },
    })
  );

  // ------------------------------------------------------------
  // Swagger
  // ------------------------------------------------------------
  const docBuilder = new DocumentBuilder()
    .setTitle('Longpoint API')
    .setDescription('Programmatically manage longpoint resources.')
    .setVersion('1.0')
    .addBearerAuth();

  if (nodeEnv === 'development') {
    docBuilder.addServer(`http://localhost:${port}`);
  }

  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, docBuilder.build(), {
      ignoreGlobalPrefix: true,
    })
  );

  // ------------------------------------------------------------
  // Miscellaneous setup
  // ------------------------------------------------------------
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: '/health', method: RequestMethod.GET },
    ],
  });
  app.use('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: nodeEnv,
    });
  });

  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
