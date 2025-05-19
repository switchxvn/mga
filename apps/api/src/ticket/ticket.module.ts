import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TicketController } from './controllers/ticket.controller';
import { TicketWebhookController } from './controllers/ticket-webhook.controller';
import { TicketService } from './services/ticket.service';
import { TicketWebhookService } from './services/ticket-webhook.service';
import { ProductModule } from '../../../backend/src/modules/product/product.module';
import { Product } from '../../../backend/src/modules/product/entities/product.entity';
import { CommonModule } from '../common/common.module';
import { ApiKeyModule } from '../../../backend/src/modules/api-key/api-key.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Product]),
    ProductModule,
    CommonModule,
    ApiKeyModule,
  ],
  controllers: [TicketController, TicketWebhookController],
  providers: [TicketService, TicketWebhookService],
  exports: [TicketService],
})
export class TicketModule {} 