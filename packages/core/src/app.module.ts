import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  AiModule,
  AuthModule,
  ClassifierModule,
  CommonModule,
  FileDeliveryModule,
  LibraryModule,
  LoggerModule,
  MediaModule,
  SearchModule,
  SetupModule,
  StorageModule,
  UploadModule,
} from './modules';
import { AuthGuard, getStaticModule, HttpExceptionFilter } from './modules/app';
import { EventModule } from './modules/event';

@Module({
  imports: [
    // System modules
    getStaticModule(),
    CommonModule,
    LoggerModule,
    EventModule,
    // Feature modules
    AiModule,
    AuthModule,
    ClassifierModule,
    FileDeliveryModule,
    LibraryModule,
    MediaModule,
    SearchModule,
    SetupModule,
    StorageModule,
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
