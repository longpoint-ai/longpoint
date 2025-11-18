import { applyDecorators } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from './event.types';

/**
 * Handle an event published by the event publisher
 * @param event - The event to handle
 * @returns
 */
export const HandleEvent = (event: Events) => {
  // TODO: Add support for redis based event publisher
  return applyDecorators(OnEvent(event));
};
