import { Module } from '@nestjs/common';
import { InMemoryQueueService, QueueService } from './queue.service';

@Module({
  providers: [
    {
      provide: QueueService,
      useFactory: () => {
        // TODO: Add support for bullmq based queue service
        return new InMemoryQueueService();
      },
    },
  ],
  exports: [QueueService],
})
export class QueueModule {}
