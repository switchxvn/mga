import { HttpException } from '@nestjs/common';

export class PayOSException extends HttpException {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
  }
} 