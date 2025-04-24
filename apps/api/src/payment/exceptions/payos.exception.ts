import { HttpException, HttpStatus } from '@nestjs/common';

export class PayOSException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        statusCode,
        message,
        error: 'PayOS Error',
      },
      statusCode,
    );
  }
} 