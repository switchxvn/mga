import { Controller, Get } from '@nestjs/common';
import { FooterFrontendService } from '../services/footer-frontend.service';

@Controller('footers')
export class FooterFrontendController {
  constructor(private readonly footerService: FooterFrontendService) {}

  @Get('active')
  getActiveFooter() {
    return this.footerService.getActiveFooter();
  }
} 