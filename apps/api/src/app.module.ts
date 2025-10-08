import { Module } from '@nestjs/common';
import { CommonApiServicesModule } from '@longpoint/api-services';

@Module({
  imports: [CommonApiServicesModule],
})
export class AppModule {}
