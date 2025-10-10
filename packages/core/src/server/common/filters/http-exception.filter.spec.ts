// import { BaseError, InvalidInput } from '@longpoint/api-errors';
// import { ErrorCode } from '@longpoint/types';
// import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
// import { HttpArgumentsHost } from '@nestjs/common/interfaces/index.js';
// import { Response } from 'express';
// import { HttpExceptionFilter } from './http-exception.filter.js';

// describe('HttpExceptionFilter', () => {
//   let filter: HttpExceptionFilter;
//   let mockResponse: jest.Mocked<Response>;
//   let mockHttpHost: jest.Mocked<HttpArgumentsHost>;
//   let mockHost: jest.Mocked<ArgumentsHost>;

//   beforeEach(() => {
//     filter = new HttpExceptionFilter();

//     // Mock Response object
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn().mockReturnThis(),
//     } as unknown as jest.Mocked<Response>;

//     // Mock HttpArgumentsHost
//     mockHttpHost = {
//       getResponse: jest.fn().mockReturnValue(mockResponse),
//       getRequest: jest.fn(),
//       getNext: jest.fn(),
//     } as jest.Mocked<HttpArgumentsHost>;

//     // Mock ArgumentsHost
//     mockHost = {
//       switchToHttp: jest.fn().mockReturnValue(mockHttpHost),
//       switchToRpc: jest.fn(),
//       switchToWs: jest.fn(),
//       getType: jest.fn(),
//       getArgs: jest.fn(),
//       getArgByIndex: jest.fn(),
//     } as jest.Mocked<ArgumentsHost>;
//   });

//   it('should return a generic error message for unknown errors', () => {
//     const error = new BaseError(
//       ErrorCode.UNKNOWN,
//       'oof sorry',
//       HttpStatus.INTERNAL_SERVER_ERROR
//     );

//     filter.catch(error, mockHost);

//     expect(mockResponse.status).toHaveBeenCalledWith(
//       HttpStatus.INTERNAL_SERVER_ERROR
//     );
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       errorCode: ErrorCode.UNKNOWN,
//       messages: ['Something went wrong, please try again later.'],
//     });
//   });

//   it('should return a generic error message even for non-base errors', () => {
//     const error = new HttpException(
//       'oof sorry',
//       HttpStatus.INTERNAL_SERVER_ERROR
//     );

//     filter.catch(error, mockHost);

//     expect(mockResponse.status).toHaveBeenCalledWith(
//       HttpStatus.INTERNAL_SERVER_ERROR
//     );
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       errorCode: ErrorCode.UNKNOWN,
//       messages: ['Something went wrong, please try again later.'],
//     });
//   });

//   it('should return the error message for base errors', () => {
//     const error = new InvalidInput('123');

//     filter.catch(error, mockHost);

//     expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
//     expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
//   });
// });
