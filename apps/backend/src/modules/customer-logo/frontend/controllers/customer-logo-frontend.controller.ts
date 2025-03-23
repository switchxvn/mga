import { Controller } from '@nestjs/common';
import { CustomerLogoFrontendService } from '../services/customer-logo-frontend.service';

@Controller('customer-logos')
export class CustomerLogoFrontendController {
  constructor(private readonly customerLogoFrontendService: CustomerLogoFrontendService) {}
} 