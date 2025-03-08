import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';
import { Tag } from '../../entities/tag.entity';
import { Settings } from '../../entities/settings.entity';

@Injectable()
export class SettingsFrontendService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Logo)
    private logoRepository: Repository<Logo>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
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

  // Tags - Frontend chỉ cần các phương thức đọc
  async findActiveTags(filters: any = {}): Promise<Tag[]> {
    return this.tagRepository.find({
      where: {
        isActive: true,
        ...filters,
      },
      order: { order: 'ASC' },
    });
  }

  async findActiveTagById(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { 
        id,
        isActive: true 
      },
    });
    
    if (!tag) {
      throw new NotFoundException(`Active tag with ID ${id} not found`);
    }
    
    return tag;
  }

  async findActiveTagBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { 
        slug,
        isActive: true 
      },
    });
    
    if (!tag) {
      throw new NotFoundException(`Active tag with slug ${slug} not found`);
    }
    
    return tag;
  }

  async getPublicSettings(): Promise<Settings[]> {
    return this.settingsRepository.find({ where: { is_public: true } });
  }

  async getPublicSettingsByGroup(group: string): Promise<Settings[]> {
    return this.settingsRepository.find({ 
      where: { 
        is_public: true,
        group 
      } 
    });
  }

  async getPublicSettingByKey(key: string): Promise<Settings> {
    return this.settingsRepository.findOne({ 
      where: { 
        is_public: true,
        key 
      } 
    });
  }
} 