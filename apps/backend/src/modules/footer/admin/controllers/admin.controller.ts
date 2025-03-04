import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { FooterAdminService } from '../services/footer-admin.service';
import { CreateFooterInput, UpdateFooterInput } from '@ew/shared';

@Controller('admin/footers')
export class FooterAdminController {
  constructor(private readonly footerService: FooterAdminService) {}

  @Post()
  create(@Body() data: CreateFooterInput) {
    return this.footerService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: UpdateFooterInput) {
    return this.footerService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.footerService.delete(id);
  }

  @Get()
  findAll() {
    return this.footerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.footerService.findOne(id);
  }

  @Put(':id/activate')
  setActive(@Param('id') id: number) {
    return this.footerService.setActive(id);
  }
} 