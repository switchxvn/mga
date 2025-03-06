import { Controller, Post } from '@nestjs/common';
import { ServiceSeedService } from './service-seed.service';

@Controller('seed/services')
export class ServiceSeedController {
  constructor(private readonly serviceSeedService: ServiceSeedService) {}

  @Post()
  async seed() {
    await this.serviceSeedService.seed();
    return { message: 'Services seeded successfully' };
  }
} 