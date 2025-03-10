import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from '../../entities/theme.entity';

@Injectable()
export class ThemeFrontendService {
  constructor(
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>,
  ) {}

  async findAll(): Promise<Theme[]> {
    return await this.themeRepository.find();
  }

  async findOne(id: number): Promise<Theme> {
    const theme = await this.themeRepository.findOne({
      where: { id }
    });
    
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
    
    return theme;
  }

  async getActiveTheme(): Promise<Theme> {
    const theme = await this.themeRepository.findOne({
      where: { isActive: true },
      relations: ['sections'],
      order: {
        sections: {
          order: 'ASC'
        }
      }
    });

    if (!theme) {
      throw new NotFoundException('No active theme found');
    }

    return theme;
  }
} 