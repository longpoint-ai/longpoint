import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CommonApiServicesModule } from '@longpoint/api-services';
import { AppController } from './app.controller';

@Module({
  imports: [
    CommonApiServicesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
