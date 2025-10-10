export const ErrorCode = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNKNOWN: 'UNKNOWN',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
