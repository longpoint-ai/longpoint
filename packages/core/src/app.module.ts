import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  AiModule,
  AuthModule,
  ClassifierModule,
  CommonModule,
  LibraryModule,
  LoggerModule,
  MediaModule,
  SetupModule,
  StorageModule,
  StorageUnitModule,
  UploadModule,
} from './modules';
import { AuthGuard, getStaticModule, HttpExceptionFilter } from './modules/app';

@Module({
  imports: [
    // System modules
    getStaticModule(),
    CommonModule,
    LoggerModule,
    // Feature modules
    AiModule,
    AuthModule,
    ClassifierModule,
    LibraryModule,
    MediaModule,
    SetupModule,
    StorageModule,
    StorageUnitModule,
    UploadModule,
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
