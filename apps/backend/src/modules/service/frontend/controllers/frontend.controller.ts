import { Controller, Get, Param } from '@nestjs/common';
import { ServiceFrontendService } from '../services/service-frontend.service';

@Controller('services')
export class ServiceFrontendController {
  constructor(private readonly serviceFrontendService: ServiceFrontendService) {}

  @Get()
  findAll() {
    return this.serviceFrontendService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceFrontendService.findOne(+id);
  }
} 