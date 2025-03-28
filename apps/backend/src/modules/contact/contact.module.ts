import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactAdminService } from './admin/services/contact-admin.service';
import { ContactFrontendService } from './frontend/services/contact-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact])
  ],
  providers: [
    ContactAdminService,
    ContactFrontendService,
  ],
  exports: [
    ContactAdminService,
    ContactFrontendService,
  ],
})
export class ContactModule {} 