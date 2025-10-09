export const ErrorCode = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
