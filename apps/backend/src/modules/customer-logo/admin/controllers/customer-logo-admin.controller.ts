import { Controller } from '@nestjs/common';
import { CustomerLogoAdminService } from '../services/customer-logo-admin.service';

@Controller('admin/customer-logos')
export class CustomerLogoAdminController {
  constructor(private readonly customerLogoAdminService: CustomerLogoAdminService) {}
} 