import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZnsWebhookEvent, ZnsLog } from '../entities';
import { ZnsMessageStatus } from '@ew/shared';

@Injectable()
export class ZnsWebhookService {
  private readonly logger = new Logger(ZnsWebhookService.name);

  constructor(
    @InjectRepository(ZnsWebhookEvent)
    private readonly webhookEventRepo: Repository<ZnsWebhookEvent>,
    @InjectRepository(ZnsLog)
    private readonly logRepo: Repository<ZnsLog>,
  ) {}

  async processWebhookEvent(eventData: any): Promise<void> {
    try {
      const webhookEvent = this.webhookEventRepo.create({
        event_name: eventData.event_name,
        msg_id: eventData.msg_id,
        tracking_id: eventData.tracking_id,
        sender: eventData.sender,
        recipient: eventData.recipient,
        delivery_time: eventData.delivery_time,
        app_id: eventData.app_id,
        timestamp: eventData.timestamp,
        raw_payload: eventData,
        processed: false,
      });

      await this.webhookEventRepo.save(webhookEvent);

      switch (eventData.event_name) {
        case 'user_received_message':
          await this.handleUserReceivedMessage(eventData);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${eventData.event_name}`);
      }

      webhookEvent.processed = true;
      await this.webhookEventRepo.save(webhookEvent);

      this.logger.log(`Processed webhook event: ${eventData.event_name}`);
    } catch (error) {
      this.logger.error(`Failed to process webhook event: ${error.message}`);
      throw error;
    }
  }

  private async handleUserReceivedMessage(eventData: any): Promise<void> {
    try {
      let log: ZnsLog | null = null;

      if (eventData.msg_id) {
        log = await this.logRepo.findOne({ where: { msg_id: eventData.msg_id } });
      }

      if (!log && eventData.tracking_id) {
        log = await this.logRepo.findOne({ where: { tracking_id: eventData.tracking_id } });
      }

      if (log) {
        log.status = ZnsMessageStatus.DELIVERED;
        log.delivery_time = eventData.delivery_time;
        await this.logRepo.save(log);
        this.logger.log(`Updated message status to DELIVERED for msg_id: ${eventData.msg_id}`);
      } else {
        this.logger.warn(`No log found for delivery event - msg_id: ${eventData.msg_id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle user_received_message: ${error.message}`);
      throw error;
    }
  }
} 