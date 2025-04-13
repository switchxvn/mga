import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketPricingSection } from './entities/ticket-pricing-section.entity';
import { TicketPricingSectionTranslation } from './entities/ticket-pricing-section-translation.entity';
import { TicketPricingSectionAdminService } from './admin/services/ticket-pricing-section-admin.service';
import { TicketPricingSectionFrontendService } from './frontend/services/ticket-pricing-section-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketPricingSection,
      TicketPricingSectionTranslation,
    ]),
  ],
  providers: [
    TicketPricingSectionAdminService,
    TicketPricingSectionFrontendService,
  ],
  exports: [
    TicketPricingSectionAdminService,
    TicketPricingSectionFrontendService,
  ],
})
export class TicketPricingModule {} 