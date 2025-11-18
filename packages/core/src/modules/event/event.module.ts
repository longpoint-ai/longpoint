import { Module } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { EventPublisher, InMemoryEventPublisher } from './event.publisher';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    {
      provide: EventPublisher,
      useFactory: (eventEmitter: EventEmitter2) => {
        // TODO: Add support for redis based event publisher
        return new InMemoryEventPublisher(eventEmitter);
      },
      inject: [EventEmitter2],
    },
  ],
  exports: [EventPublisher],
})
export class EventModule {}
