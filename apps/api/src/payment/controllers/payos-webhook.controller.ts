import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PayOSWebhookDto } from '../dtos/payos-webhook.dto';
import { PayOSWebhookService } from '../services/payos-webhook.service';

@ApiTags('PayOS Webhook')
@Controller('webhook/payos')
export class PayOSWebhookController {
  private readonly logger = new Logger(PayOSWebhookController.name);

  constructor(private readonly payosWebhookService: PayOSWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle PayOS payment notification webhook' })
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
      },
    },
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