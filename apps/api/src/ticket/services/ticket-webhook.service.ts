import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Product } from '../../../../backend/src/modules/product/entities/product.entity';
import { TicketWebhookDto } from '../dtos/ticket-webhook.dto';
import { ProductType } from '../../common/constants/order.enum';

// Mở rộng type Product để thêm các property thiếu
type ExtendedProduct = Product & {
  sale_price?: number;
  valid_from?: Date;
  valid_until?: Date;
  is_active: boolean;
};

@Injectable()
export class TicketWebhookService {
  private readonly logger = new Logger(TicketWebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async processWebhook(webhookData: TicketWebhookDto): Promise<void> {
    try {
      this.logger.log('Processing ticket webhook', webhookData.eventType);
      
      // Verify webhook signature
      const isValid = this.verifySignature(webhookData);
      if (!isValid) {
        this.logger.error('Invalid webhook signature');
        throw new Error('Invalid webhook signature');
      }

      // Process based on event type
      if (webhookData.eventType === 'ticket.update') {
        await this.processTicketUpdates(webhookData);
      } else {
        this.logger.warn(`Unhandled event type: ${webhookData.eventType}`);
      }

      this.logger.log('Successfully processed ticket webhook');
    } catch (error) {
      this.logger.error('Error processing ticket webhook:', error);
      throw error;
    }
  }

  private async processTicketUpdates(webhookData: TicketWebhookDto): Promise<void> {
    const updates = webhookData.data;
    
    for (const update of updates) {
      try {
        // Cast type để TypeScript không báo lỗi
        const ticket = await this.productRepository.findOne({
          where: { id: update.ticketId, type: ProductType.TICKET as any },
        }) as ExtendedProduct;

        if (!ticket) {
          this.logger.warn(`Ticket with ID ${update.ticketId} not found, skipping update`);
          continue;
        }

        // Update ticket properties
        if (update.availableQuantity !== undefined) {
          ticket.quantity = update.availableQuantity;
        }

        if (update.price !== undefined) {
          ticket.price = update.price;
        }

        if (update.salePrice !== undefined) {
          ticket.sale_price = update.salePrice;
        }

        if (update.validFrom !== undefined) {
          ticket.valid_from = new Date(update.validFrom);
        }

        if (update.validUntil !== undefined) {
          ticket.valid_until = new Date(update.validUntil);
        }

        if (update.isAvailable !== undefined) {
          ticket.is_active = update.isAvailable;
        }

        // Save the updated ticket - cast lại để tránh lỗi TypeScript
        await this.productRepository.save(ticket as any);
        this.logger.log(`Updated ticket ${update.ticketId}`);
      } catch (error) {
        this.logger.error(`Error updating ticket ${update.ticketId}:`, error);
        // Continue with other updates even if one fails
      }
    }
  }

  private verifySignature(webhookData: TicketWebhookDto): boolean {
    try {
      const webhookSecret = this.configService.get<string>('TIKTOUR_WEBHOOK_SECRET');
      
      if (!webhookSecret) {
        this.logger.error('Webhook secret not configured');
        return false;
      }

      // Create a copy of the data without the signature for verification
      const { signature, ...dataToVerify } = webhookData;
      
      // Sort keys alphabetically for consistent ordering
      const orderedData = JSON.stringify(this.sortObjectKeys(dataToVerify));
      
      // Create HMAC hash
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const calculatedSignature = hmac.update(orderedData).digest('hex');
      
      return calculatedSignature === signature;
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  private sortObjectKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = this.sortObjectKeys(obj[key]);
        return result;
      }, {} as any);
  }
} 