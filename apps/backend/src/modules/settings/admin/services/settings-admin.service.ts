import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../dto/menu-item.dto';
import { CreateLogoDto, UpdateLogoDto } from '../dto/logo.dto';

@Injectable()
export class SettingsAdminService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Logo)
    private logoRepository: Repository<Logo>,
  ) {}

  // Menu Items
  async findAllMenuItems(filters: any = {}): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: filters,
      relations: ['parent', 'children'],
      order: { order: 'ASC' },
    });
  }

  async findMenuItemById(id: number): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    
    return menuItem;
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = this.menuItemRepository.create(createMenuItemDto);
    
    if (createMenuItemDto.parentId) {
      const parent = await this.menuItemRepository.findOne({
        where: { id: createMenuItemDto.parentId },
      });
      
      if (!parent) {
        throw new NotFoundException(`Parent menu item with ID ${createMenuItemDto.parentId} not found`);
      }
      
      menuItem.parent = parent;
    }
    
    return this.menuItemRepository.save(menuItem);
  }

  async updateMenuItem(id: number, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.findMenuItemById(id);
    
    // Update parent if parentId is provided
    if (updateMenuItemDto.parentId !== undefined) {
      if (updateMenuItemDto.parentId === null) {
        menuItem.parent = null;
      } else {
        const parent = await this.menuItemRepository.findOne({
          where: { id: updateMenuItemDto.parentId },
        });
        
        if (!parent) {
          throw new NotFoundException(`Parent menu item with ID ${updateMenuItemDto.parentId} not found`);
        }
        
        menuItem.parent = parent;
      }
      
      delete updateMenuItemDto.parentId;
    }
    
    // Update other properties
    Object.assign(menuItem, updateMenuItemDto);
    
    return this.menuItemRepository.save(menuItem);
  }

  async deleteMenuItem(id: number): Promise<{ success: boolean; message: string }> {
    const menuItem = await this.findMenuItemById(id);
    
    // Check if the menu item has children
    const children = await this.menuItemRepository.find({
      where: { parent: { id } },
    });
    
    if (children.length > 0) {
      throw new Error('Cannot delete menu item with children. Please delete or reassign children first.');
    }
    
    await this.menuItemRepository.remove(menuItem);
    
    return {
      success: true,
      message: `Menu item with ID ${id} has been deleted`,
    };
  }

  // Logos
  async findAllLogos(filters: any = {}): Promise<Logo[]> {
    return this.logoRepository.find({
      where: filters,
      order: { createdAt: 'DESC' },
    });
  }

  async findLogoById(id: number): Promise<Logo> {
    const logo = await this.logoRepository.findOne({
      where: { id },
    });
    
    if (!logo) {
      throw new NotFoundException(`Logo with ID ${id} not found`);
    }
    
    return logo;
  }

  async createLogo(createLogoDto: CreateLogoDto): Promise<Logo> {
    const logo = this.logoRepository.create(createLogoDto);
    return this.logoRepository.save(logo);
  }

  async updateLogo(id: number, updateLogoDto: UpdateLogoDto): Promise<Logo> {
    const logo = await this.findLogoById(id);
    
    Object.assign(logo, updateLogoDto);
    
    return this.logoRepository.save(logo);
  }

  async deleteLogo(id: number): Promise<{ success: boolean; message: string }> {
    const logo = await this.findLogoById(id);
    
    await this.logoRepository.remove(logo);
    
    return {
      success: true,
      message: `Logo with ID ${id} has been deleted`,
    };
  }
} 