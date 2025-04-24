import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTicketSection } from './entities/order-ticket-section.entity';
import { OrderTicketSectionTranslation } from './entities/order-ticket-section-translation.entity';
import { OrderTicketSectionAdminService } from './admin/services/order-ticket-section-admin.service';
import { OrderTicketSectionFrontendService } from './frontend/services/order-ticket-section-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderTicketSection,
      OrderTicketSectionTranslation,
    ]),
  ],
  providers: [
    OrderTicketSectionAdminService,
    OrderTicketSectionFrontendService,
  ],
  exports: [
    OrderTicketSectionAdminService,
    OrderTicketSectionFrontendService,
  ],
})
export class OrderTicketModule {} 