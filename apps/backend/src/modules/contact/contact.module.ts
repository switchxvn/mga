import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactSection } from './entities/contact-section.entity';
import { ContactSectionTranslation } from './entities/contact-section-translation.entity';
import { ContactSectionAdminService } from './admin/services/contact-section-admin.service';
import { ContactSectionFrontendService } from './frontend/services/contact-section-frontend.service';
import { ContactAdminService } from './admin/services/contact-admin.service';
import { ContactFrontendService } from './frontend/services/contact-frontend.service';
import { Contact } from './entities/contact.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactSection,
      ContactSectionTranslation,
      Contact,
    ]),
  ],
  providers: [
    ContactSectionAdminService,
    ContactSectionFrontendService,
    ContactAdminService,
    ContactFrontendService,
  ],
  exports: [
    ContactSectionAdminService,
    ContactSectionFrontendService,
    ContactAdminService,
    ContactFrontendService,
  ],
})
export class ContactModule {} 