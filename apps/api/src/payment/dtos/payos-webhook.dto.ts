import { IsBoolean, IsNotEmpty, IsObject, IsString, IsNumber } from 'class-validator';

export class PayOSWebhookDataDto {
  @IsNumber()
  @IsNotEmpty({ message: 'orderCode is required' })
  orderCode: number;

  @IsNumber()
  @IsNotEmpty({ message: 'amount is required' })
  amount: number;

  @IsString()
  description: string;

  @IsString()
  accountNumber: string;

  @IsString()
  reference: string;

  @IsString()
  transactionDateTime: string;

  @IsString()
  currency: string;

  @IsString()
  paymentLinkId: string;

  @IsString()
  code: string;

  @IsString()
  desc: string;

  @IsString()
  counterAccountBankId: string;

  @IsString()
  counterAccountBankName: string;

  @IsString()
  counterAccountName: string;

  @IsString()
  counterAccountNumber: string;

  @IsString()
  virtualAccountName: string;

  @IsString()
  virtualAccountNumber: string;
}

export class PayOSWebhookDto {
  @IsString()
  @IsNotEmpty({ message: 'code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'desc is required' })
  desc: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'success is required' })
  success: boolean;

  @IsObject()
  @IsNotEmpty({ message: 'data is required' })
  data: PayOSWebhookDataDto;

  @IsString()
  @IsNotEmpty({ message: 'signature is required' })
  signature: string;
} 