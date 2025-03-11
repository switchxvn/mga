import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponentStyleConfig } from '../../entities/component-style-config.entity';

@Injectable()
export class ComponentStyleConfigAdminService {
  constructor(
    @InjectRepository(ComponentStyleConfig)
    private readonly componentStyleConfigRepository: Repository<ComponentStyleConfig>,
  ) {}

  async findAll(): Promise<ComponentStyleConfig[]> {
    return this.componentStyleConfigRepository.find({
      order: { themeId: 'ASC', type: 'ASC' },
    });
  }

  async findByThemeId(themeId: number): Promise<ComponentStyleConfig[]> {
    return this.componentStyleConfigRepository.find({
      where: { themeId },
      order: { type: 'ASC' },
    });
  }

  async findByThemeIdAndType(themeId: number, type: string): Promise<ComponentStyleConfig | null> {
    return this.componentStyleConfigRepository.findOne({
      where: { themeId, type },
    });
  }

  async findById(id: number): Promise<ComponentStyleConfig> {
    const config = await this.componentStyleConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Component style config with ID ${id} not found`);
    }

    return config;
  }

  async create(data: Partial<ComponentStyleConfig>): Promise<ComponentStyleConfig> {
    const config = this.componentStyleConfigRepository.create(data);
    return this.componentStyleConfigRepository.save(config);
  }

  async update(id: number, data: Partial<ComponentStyleConfig>): Promise<ComponentStyleConfig> {
    await this.findById(id); // Verify existence
    await this.componentStyleConfigRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.componentStyleConfigRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Component style config with ID ${id} not found`);
    }
  }

  async upsertByThemeIdAndType(
    themeId: number,
    type: string,
    data: Partial<ComponentStyleConfig>,
  ): Promise<ComponentStyleConfig> {
    const existing = await this.findByThemeIdAndType(themeId, type);

    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create({ ...data, themeId, type });
    }
  }
} 