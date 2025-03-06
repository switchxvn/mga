import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ServiceAdminService } from '../services/service-admin.service';
import { Service } from '../../entities/service.entity';

@Controller('admin/services')
export class ServiceAdminController {
  constructor(private readonly serviceAdminService: ServiceAdminService) {}

  @Get()
  findAll() {
    return this.serviceAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceAdminService.findOne(+id);
  }

  @Post()
  create(@Body() serviceData: Partial<Service>) {
    return this.serviceAdminService.create(serviceData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() serviceData: Partial<Service>) {
    return this.serviceAdminService.update(+id, serviceData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceAdminService.remove(+id);
  }
} 