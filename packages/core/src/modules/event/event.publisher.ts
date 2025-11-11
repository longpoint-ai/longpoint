import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloads, Events } from './event.types';

export abstract class EventPublisher {
  abstract publish<T extends Events>(
    event: T,
    payload: EventPayloads[T]
  ): Promise<void>;
}

@Injectable()
export class InMemoryEventPublisher extends EventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async publish<T extends Events>(
    event: T,
    payload: EventPayloads[T]
  ): Promise<void> {
    this.eventEmitter.emit(event, payload);
  }
}
