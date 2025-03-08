import { Controller, Get, Param, Query } from '@nestjs/common';
import { FeatureFlagsFrontendService } from '../services/feature-flags-frontend.service';
import { FeatureFlag } from '../../entities/feature-flag.entity';

@Controller('feature-flags')
export class FeatureFlagsFrontendController {
  constructor(private readonly featureFlagsService: FeatureFlagsFrontendService) {}

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

  @Get('check/:key')
  async isFeatureEnabled(
    @Param('key') key: string,
    @Query('defaultValue') defaultValue: string,
  ): Promise<{ enabled: boolean }> {
    const defaultValueBool = defaultValue === 'true';
    const enabled = await this.featureFlagsService.isFeatureEnabled(key, defaultValueBool);
    return { enabled };
  }
} 