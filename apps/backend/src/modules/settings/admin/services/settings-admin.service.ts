import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';
import { Tag } from '../../entities/tag.entity';
import { z } from 'zod';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  createLogoSchema,
  updateLogoSchema,
  createTagSchema,
  updateTagSchema,
} from '@ew/shared';

type CreateMenuItem = z.infer<typeof createMenuItemSchema>;
type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;
type CreateLogo = z.infer<typeof createLogoSchema>;
type UpdateLogo = z.infer<typeof updateLogoSchema>;
type CreateTag = z.infer<typeof createTagSchema>;
type UpdateTag = z.infer<typeof updateTagSchema>;

@Injectable()
export class SettingsAdminService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Logo)
    private logoRepository: Repository<Logo>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
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

  async createMenuItem(data: CreateMenuItem): Promise<MenuItem> {
    const menuItem = this.menuItemRepository.create(data);
    
    if (data.parentId) {
      const parent = await this.menuItemRepository.findOne({
        where: { id: data.parentId },
      });
      
      if (!parent) {
        throw new NotFoundException(`Parent menu item with ID ${data.parentId} not found`);
      }
      
      menuItem.parent = parent;
    }
    
    return this.menuItemRepository.save(menuItem);
  }

  async updateMenuItem(id: number, data: UpdateMenuItem): Promise<MenuItem> {
    const menuItem = await this.findMenuItemById(id);
    
    // Update parent if parentId is provided
    if ('parentId' in data && data.parentId !== undefined) {
      if (data.parentId === null) {
        menuItem.parent = null;
      } else {
        const parent = await this.menuItemRepository.findOne({
          where: { id: data.parentId as number },
        });

        if (!parent) {
          throw new NotFoundException(`Parent menu item with ID ${data.parentId} not found`);
        }

        menuItem.parent = parent;
      }

      // Create a new object without parentId to avoid TypeORM issues
      const { parentId, ...restData } = data;
      Object.assign(menuItem, restData);
    } else {
      // Update other properties
      Object.assign(menuItem, data);
    }
    
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

  async createLogo(data: CreateLogo): Promise<Logo> {
    const logo = this.logoRepository.create({
      ...data,
      altText: data.alt,
    });
    return this.logoRepository.save(logo);
  }

  async updateLogo(id: number, data: UpdateLogo): Promise<Logo> {
    const logo = await this.findLogoById(id);
    
    // Handle altText if alt is provided
    if ('alt' in data) {
      const updatedData = {
        ...data,
        altText: data.alt,
      };
      
      // Remove alt property
      const { alt, ...cleanData } = updatedData;
      Object.assign(logo, cleanData);
    } else {
      // Update with original data
      Object.assign(logo, data);
    }
    
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

  // Tags
  async findAllTags(filters: any = {}): Promise<Tag[]> {
    return this.tagRepository.find({
      where: filters,
      order: { order: 'ASC' },
    });
  }

  async findTagById(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });
    
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    
    return tag;
  }

  async createTag(data: CreateTag): Promise<Tag> {
    const tag = this.tagRepository.create(data);
    return this.tagRepository.save(tag);
  }

  async updateTag(id: number, data: UpdateTag): Promise<Tag> {
    const tag = await this.findTagById(id);
    
    // Update the tag with the new data
    Object.assign(tag, data);
    
    return this.tagRepository.save(tag);
  }

  async deleteTag(id: number): Promise<void> {
    const tag = await this.findTagById(id);
    await this.tagRepository.remove(tag);
  }
} 