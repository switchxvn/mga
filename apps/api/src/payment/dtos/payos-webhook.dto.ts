import { IsBoolean, IsNotEmpty, IsObject, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayOSWebhookDataDto {
  @ApiProperty({
    description: 'Order code/ID from the system',
    example: 12345,
    required: true
  })
  @IsNumber()
  @IsNotEmpty({ message: 'orderCode is required' })
  orderCode: number;

  @ApiProperty({
    description: 'Payment amount in VND',
    example: 100000,
    required: true
  })
  @IsNumber()
  @IsNotEmpty({ message: 'amount is required' })
  amount: number;

  @ApiProperty({
    description: 'Payment description',
    example: 'Payment for order #12345',
    required: false
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Account number',
    example: '9123456789',
    required: false
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Payment reference',
    example: 'REF123456',
    required: false
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'Transaction date and time',
    example: '2023-01-01T12:00:00Z',
    required: false
  })
  @IsString()
  transactionDateTime: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'VND',
    required: false
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Payment link ID from PayOS',
    example: 'pl_123456789',
    required: false
  })
  @IsString()
  paymentLinkId: string;

  @ApiProperty({
    description: 'PayOS response code',
    example: '00',
    required: false
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'PayOS response description',
    example: 'Success',
    required: false
  })
  @IsString()
  desc: string;

  @ApiProperty({
    description: 'Counter account bank ID',
    example: 'BIDV',
    required: false
  })
  @IsString()
  counterAccountBankId: string;

  @ApiProperty({
    description: 'Counter account bank name',
    example: 'Bank for Investment and Development of Vietnam',
    required: false
  })
  @IsString()
  counterAccountBankName: string;

  @ApiProperty({
    description: 'Counter account name',
    example: 'NGUYEN VAN A',
    required: false
  })
  @IsString()
  counterAccountName: string;

  @ApiProperty({
    description: 'Counter account number',
    example: '1234567890',
    required: false
  })
  @IsString()
  counterAccountNumber: string;

  @ApiProperty({
    description: 'Virtual account name',
    example: 'EW Company',
    required: false
  })
  @IsString()
  virtualAccountName: string;

  @ApiProperty({
    description: 'Virtual account number',
    example: '9876543210',
    required: false
  })
  @IsString()
  virtualAccountNumber: string;
}

export class PayOSWebhookDto {
  @ApiProperty({
    description: 'Response code',
    example: '00',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'code is required' })
  code: string;

  @ApiProperty({
    description: 'Response description',
    example: 'Success',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'desc is required' })
  desc: string;

  @ApiProperty({
    description: 'Transaction success status',
    example: true,
    required: true
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'success is required' })
  success: boolean;

  @ApiProperty({
    description: 'Transaction data',
    type: PayOSWebhookDataDto,
    required: true
  })
  @IsObject()
  @IsNotEmpty({ message: 'data is required' })
  data: PayOSWebhookDataDto;

  @ApiProperty({
    description: 'Verification signature',
    example: 'a1b2c3d4e5f6g7h8i9j0...',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'signature is required' })
  signature: string;
} 