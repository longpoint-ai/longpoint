import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';

/**
 * Logger based off of the pino logger.
 *
 * **Do not use this directly.** Use the Logger class from the `@nestjs/common` package instead,
 * which will automatically leverage the configuration in this module.
 *
 * @example
 * ```ts
 * import { Logger } from '@nestjs/common';
 *
 * class MyService {
 *   private readonly logger = new Logger(MyService.name);
 *
 *   async hello() {
 *     this.logger.log('Hello, world!');
 *   }
 * }
 * ```
 * }
 * ```
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly pinoLogger: PinoLogger;

  // Define NestJS contexts that should be filtered to DEBUG level
  private readonly nestJsContexts = [
    'NestFactory',
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestApplication',
    'NestMicroservice',
  ];

  constructor(pinoLogger: PinoLogger) {
    this.pinoLogger = pinoLogger;
  }

  log(message: string, context?: string) {
    if (this.shouldFilterToDebug(context)) {
      this.pinoLogger.debug(message, context);
    } else {
      this.pinoLogger.log(message, context);
    }
  }

  error(message: string, trace?: string, context?: string) {
    this.pinoLogger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.pinoLogger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.pinoLogger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.pinoLogger.verbose(message, context);
  }

  private shouldFilterToDebug(context?: string): boolean {
    return context ? this.nestJsContexts.includes(context) : false;
  }
}
