import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';

@Injectable()
export class SettingsFrontendService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Logo)
    private logoRepository: Repository<Logo>,
  ) {}

  // Menu Items - Frontend chỉ cần các phương thức đọc
  async findActiveMenuItems(filters: any = {}): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: {
        isActive: true,
        ...filters,
      },
      relations: ['parent', 'children'],
      order: { order: 'ASC' },
    });
  }

  async findActiveMenuItemById(id: number): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { 
        id,
        isActive: true 
      },
      relations: ['parent', 'children'],
    });
    
    if (!menuItem) {
      throw new NotFoundException(`Active menu item with ID ${id} not found`);
    }
    
    return menuItem;
  }

  // Logos - Frontend chỉ cần các phương thức đọc
  async findActiveLogos(filters: any = {}): Promise<Logo[]> {
    return this.logoRepository.find({
      where: {
        isActive: true,
        ...filters,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveLogoByType(type: string): Promise<Logo> {
    const logos = await this.logoRepository.find({
      where: {
        type,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    
    if (logos.length === 0) {
      return null;
    }
    
    return logos[0];
  }
} 