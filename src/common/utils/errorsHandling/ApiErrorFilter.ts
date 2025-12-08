// import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
// import { Response } from 'express';

// import { ApiError } from './ApiError';

// @Catch()
// export class ApiErrorFilter implements ExceptionFilter {
//   catch(exception: any, host: ArgumentsHost) {
//     const response = host.switchToHttp().getResponse<Response>();
//     const status = exception.statusCode || 500;

//     let errorMessage = 'Something went wrong';
//     let errorDetails = null;

//     // If the exception is an instance of ApiError, use its properties
//     if (exception instanceof ApiError) {
//       errorMessage = exception.message;
//       errorDetails = exception.details || null;
//     } else if (exception instanceof Error) {
//       // In case of other types of errors, we can provide more information
//       errorMessage = exception.message;
//       errorDetails = exception.stack; // You can decide whether to include stack traces
//     }

//     response.status(status).json({
//       isSuccess: false,
//       statusCode: status,
//       message: errorMessage,
//       details: errorDetails,
//       stack: exception.stack, // Optional: Include the stack trace for debugging (can be hidden in production)
//     });
//   }
// }

import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.statusCode || 500;

    const isDevelopment = process.env.NODE_ENV === 'development';

    const errorMessage = isDevelopment
      ? exception.message || 'Internal server error'
      : 'An unexpected error occurred. Please try again later.';

    const errorDetails = isDevelopment
      ? exception.stack || exception.details
      : null;

    if (isDevelopment) {
      response.status(status).json({
        isSuccess: false,
        statusCode: status,
        message: errorMessage,
        details: errorDetails,
      });
    } else {
      response.status(status).json({
        isSuccess: false,
        statusCode: status,
        message: errorMessage,
      });
    }
  }
}
