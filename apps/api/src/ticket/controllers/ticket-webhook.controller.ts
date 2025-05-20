import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TicketWebhookService } from '../services/ticket-webhook.service';
import { TicketWebhookDto } from '../dtos/ticket-webhook.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Ticket Webhooks')
@Controller('webhook/ticket-updates')
@ApiSecurity('api-key')
@ApiSecurity('api-secret')
@UseGuards(ApiKeyGuard)
export class TicketWebhookController {
  constructor(private readonly ticketWebhookService: TicketWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle ticket update webhook from TikTour' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid webhook data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid API credentials' })
  async handleWebhook(@Body() webhookData: TicketWebhookDto) {
    await this.ticketWebhookService.processWebhook(webhookData);
    return { success: true, message: 'Webhook processed successfully' };
  }
} 