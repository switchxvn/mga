import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PayOSWebhookDto } from '../dtos/payos-webhook.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { PayOSWebhookService } from '../services/payos-webhook.service';

@ApiTags('PayOS Webhook')
@Controller('webhook/payos')
export class PayOSWebhookController {
  private readonly logger = new Logger(PayOSWebhookController.name);

  constructor(private readonly payosWebhookService: PayOSWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Handle PayOS payment notification webhook',
    description: 'Endpoint for receiving payment notifications from PayOS gateway'
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authorization',
    required: true,
  })
  @ApiHeader({
    name: 'x-api-secret',
    description: 'API Secret for authorization',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully processed webhook',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
          example: 'Payment processed successfully',
          nullable: true
        }
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid API credentials',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook data or signature',
  })
  async handleWebhook(@Body() webhookData: PayOSWebhookDto) {
    // For testing purposes
    if (!webhookData.signature) {
      return { success: true, message: 'Skipped processing for testing' };
    }

    try {
      await this.payosWebhookService.processWebhook(webhookData);
      return { success: true };
    } catch (error) {
      this.logger.error('Error processing PayOS webhook:', error);
      throw error;
    }
  }
} 