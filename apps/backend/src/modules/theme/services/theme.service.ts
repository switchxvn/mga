import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from '../entities/theme.entity';

@Injectable()
export class ThemeService {
  constructor(
    @InjectRepository(Theme)
    private themeRepository: Repository<Theme>,
  ) {}

  async create(createThemeDto: Partial<Theme>): Promise<Theme> {
    const theme = this.themeRepository.create(createThemeDto);
    return await this.themeRepository.save(theme);
  }

  async findAll(): Promise<Theme[]> {
    return await this.themeRepository.find();
  }

  async findOne(id: number): Promise<Theme> {
    return await this.themeRepository.findOneOrFail({ where: { id } });
  }

  async update(id: number, updateThemeDto: Partial<Theme>): Promise<Theme> {
    await this.themeRepository.update(id, updateThemeDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.themeRepository.delete(id);
  }

  async getActiveTheme(): Promise<Theme> {
    return await this.themeRepository.findOneOrFail({ 
      where: { isActive: true } 
    });
  }

  async setActiveTheme(id: number): Promise<void> {
    await this.themeRepository.update({}, { isActive: false });
    await this.themeRepository.update(id, { isActive: true });
  }
} 