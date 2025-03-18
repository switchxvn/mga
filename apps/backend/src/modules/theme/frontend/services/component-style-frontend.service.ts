import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponentStyleConfig } from '../../entities/component-style-config.entity';
import { ThemeFrontendService } from './theme-frontend.service';

@Injectable()
export class ComponentStyleFrontendService {
  constructor(
    @InjectRepository(ComponentStyleConfig)
    private readonly componentStyleConfigRepository: Repository<ComponentStyleConfig>,
    private readonly themeFrontendService: ThemeFrontendService,
  ) {}

  async findByType(type: string, themeId?: number): Promise<ComponentStyleConfig> {
    let targetThemeId = themeId;

    if (!targetThemeId) {
      const activeTheme = await this.themeFrontendService.getActiveTheme();
      targetThemeId = activeTheme.id;
    }

    const config = await this.componentStyleConfigRepository.findOne({
      where: { 
        type,
        themeId: targetThemeId,
        isActive: true
      }
    });

    if (!config) {
      throw new NotFoundException(`Component style config for type "${type}" not found`);
    }

    return config;
  }
} 