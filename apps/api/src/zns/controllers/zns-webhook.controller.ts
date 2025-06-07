import { Controller, Post, Body, Logger, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ZnsWebhookService } from '../../../../backend/src/modules/zns/services/zns-webhook.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('ZNS Webhook')
@Controller('webhook/zns')
@ApiSecurity('api-key')
@ApiSecurity('api-secret')
@UseGuards(ApiKeyGuard)
export class ZnsWebhookController {
  private readonly logger = new Logger(ZnsWebhookController.name);

  constructor(private readonly webhookService: ZnsWebhookService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Handle ZNS delivery status webhook from Zalo',
    description: 'Endpoint for receiving message delivery notifications from Zalo ZNS'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully processed webhook',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook data'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid API credentials'
  })
  async handleWebhook(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      this.logger.log(`Received ZNS webhook: ${JSON.stringify(body)}`);

      // Basic validation
      if (!body.event_name) {
        this.logger.warn('Webhook missing event_name');
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing event_name' });
        return;
      }

      // Process the webhook event
      await this.webhookService.processWebhookEvent(body);

      // Respond with success
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        error: 'Webhook processing failed' 
      });
    }
  }
} 