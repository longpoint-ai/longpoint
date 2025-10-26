import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { ClassifierModule } from '../classifier/classifier.module';
import { CommonModule } from '../common/common.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { LibraryModule } from '../library/library.module';
import { LoggerModule } from '../logger/logger.module';
import { MediaModule } from '../media/media.module';
import { ModelModule } from '../model/model.module';
import { SetupModule } from '../setup/setup.module';
import { getStaticModule } from './get-static-module';

@Module({
  imports: [
    getStaticModule(),
    CommonModule,
    LoggerModule,
    // Feature modules
    AiProviderModule,
    AuthModule,
    ClassifierModule,
    LibraryModule,
    MediaModule,
    ModelModule,
    SetupModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
