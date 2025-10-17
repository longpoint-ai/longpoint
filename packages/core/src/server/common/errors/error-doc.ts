import { BaseError } from './base.error';

export const apiErrorDoc = (error: BaseError) => ({
  example: error.toJSON(),
  schema: {
    type: 'object',
    properties: {
      errorCode: { type: 'string' },
      messages: { type: 'array', items: { type: 'string' } },
    },
  },
});
