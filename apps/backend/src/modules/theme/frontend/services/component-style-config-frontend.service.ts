import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponentStyleConfig } from '../../entities/component-style-config.entity';

@Injectable()
export class ComponentStyleConfigFrontendService {
  constructor(
    @InjectRepository(ComponentStyleConfig)
    private readonly componentStyleConfigRepository: Repository<ComponentStyleConfig>,
  ) {}

  async findAll(): Promise<ComponentStyleConfig[]> {
    return this.componentStyleConfigRepository.find({
      where: { isActive: true },
      order: { themeId: 'ASC', type: 'ASC' },
    });
  }

  async findByThemeId(themeId: number): Promise<ComponentStyleConfig[]> {
    return this.componentStyleConfigRepository.find({
      where: { themeId, isActive: true },
      order: { type: 'ASC' },
    });
  }

  async findByThemeIdAndType(themeId: number, type: string): Promise<ComponentStyleConfig | null> {
    return this.componentStyleConfigRepository.findOne({
      where: { themeId, type, isActive: true },
    });
  }

  async findById(id: number): Promise<ComponentStyleConfig> {
    const config = await this.componentStyleConfigRepository.findOne({
      where: { id, isActive: true },
    });

    if (!config) {
      throw new NotFoundException(`Component style config with ID ${id} not found or not active`);
    }

    return config;
  }

  async findActiveComponentStylesByTheme(themeId: number): Promise<Record<string, any>> {
    const configs = await this.findByThemeId(themeId);
    
    // Tạo một object với key là type và value là settings
    return configs.reduce((result, config) => {
      result[config.type] = {
        id: config.id,
        title: config.title,
        settings: config.settings,
      };
      return result;
    }, {} as Record<string, any>);
  }
} 