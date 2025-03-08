import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { FeatureFlagsAdminService } from '../services/feature-flags-admin.service';
import { FeatureFlag } from '../../entities/feature-flag.entity';

@Controller('admin/feature-flags')
export class FeatureFlagsAdminController {
  constructor(private readonly featureFlagsService: FeatureFlagsAdminService) {}

  @Get()
  async findAll(): Promise<FeatureFlag[]> {
    return this.featureFlagsService.findAll();
  }

  @Get(':key')
  async findByKey(@Param('key') key: string): Promise<FeatureFlag> {
    return this.featureFlagsService.findByKey(key);
  }

  @Get('group/:group')
  async findByGroup(@Param('group') group: string): Promise<FeatureFlag[]> {
    return this.featureFlagsService.findByGroup(group);
  }

  @Post()
  async create(@Body() data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    return this.featureFlagsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<FeatureFlag>,
  ): Promise<FeatureFlag> {
    return this.featureFlagsService.update(id, data);
  }

  @Put('key/:key')
  async updateByKey(
    @Param('key') key: string,
    @Body('enabled') enabled: boolean,
  ): Promise<FeatureFlag> {
    return this.featureFlagsService.updateByKey(key, enabled);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.featureFlagsService.delete(id);
  }

  @Get('check/:key')
  async isFeatureEnabled(
    @Param('key') key: string,
    @Body('defaultValue') defaultValue: boolean = true,
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.featureFlagsService.isFeatureEnabled(key, defaultValue);
    return { enabled };
  }
} 