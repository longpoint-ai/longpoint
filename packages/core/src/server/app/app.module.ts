import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { SetupModule } from '../setup/setup.module';
import { getLoggerModule } from './get-logger-module';
import { getStaticModule } from './get-static-module';

@Module({
  imports: [
    getLoggerModule(),
    getStaticModule(),
    CommonModule,
    // Features modules
    AuthModule,
    SetupModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
