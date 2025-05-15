import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminMenuItem, AdminMenuItemTranslation } from '../../entities';

@Injectable()
export class AdminMenuAdminService {
  private readonly logger = new Logger(AdminMenuAdminService.name);

  constructor(
    @InjectRepository(AdminMenuItem)
    private readonly adminMenuItemRepository: Repository<AdminMenuItem>,
    @InjectRepository(AdminMenuItemTranslation)
    private readonly adminMenuItemTranslationRepository: Repository<AdminMenuItemTranslation>
  ) {}

  async findAll(options?: { includeInactive?: boolean, locale?: string }): Promise<AdminMenuItem[]> {
    const { includeInactive = false, locale = 'en' } = options || {};
    
    return this.adminMenuItemRepository.find({
      where: includeInactive ? {} : { isActive: true },
      relations: ['parent', 'children', 'translations'],
      order: { order: 'ASC' }
    });
  }

  async findById(id: number): Promise<AdminMenuItem> {
    const menuItem = await this.adminMenuItemRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'translations']
    });

    if (!menuItem) {
      throw new NotFoundException(`Admin menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async findByCode(code: string): Promise<AdminMenuItem | null> {
    return this.adminMenuItemRepository.findOne({
      where: { code },
      relations: ['parent', 'children', 'translations']
    });
  }

  async create(createDto: {
    code: string;
    icon?: string;
    path?: string;
    parentId?: number | null;
    order?: number;
    isActive?: boolean;
    availableForRoles?: string | null;
    translations: { locale: string; name: string }[];
  }): Promise<AdminMenuItem> {
    const { translations, ...menuItemData } = createDto;
    
    // Create the menu item
    const adminMenuItem = this.adminMenuItemRepository.create(menuItemData);
    const savedMenuItem = await this.adminMenuItemRepository.save(adminMenuItem);
    
    // Create translations
    if (translations && translations.length > 0) {
      const translationEntities = translations.map(translation => 
        this.adminMenuItemTranslationRepository.create({
          adminMenuItemId: savedMenuItem.id,
          locale: translation.locale,
          name: translation.name
        })
      );
      
      await this.adminMenuItemTranslationRepository.save(translationEntities);
    }
    
    // Reload the menu item with translations
    return this.findById(savedMenuItem.id);
  }

  async update(id: number, updateDto: {
    code?: string;
    icon?: string;
    path?: string;
    parentId?: number | null;
    order?: number;
    isActive?: boolean;
    availableForRoles?: string | null;
    translations?: { locale: string; name: string }[];
  }): Promise<AdminMenuItem> {
    const menuItem = await this.findById(id);
    const { translations, ...menuItemData } = updateDto;
    
    // Update the menu item
    Object.assign(menuItem, menuItemData);
    await this.adminMenuItemRepository.save(menuItem);
    
    // Update translations if provided
    if (translations && translations.length > 0) {
      for (const translation of translations) {
        // Check if translation exists
        const existingTranslation = await this.adminMenuItemTranslationRepository.findOne({
          where: {
            adminMenuItemId: id,
            locale: translation.locale
          }
        });
        
        if (existingTranslation) {
          // Update existing translation
          existingTranslation.name = translation.name;
          await this.adminMenuItemTranslationRepository.save(existingTranslation);
        } else {
          // Create new translation
          const newTranslation = this.adminMenuItemTranslationRepository.create({
            adminMenuItemId: id,
            locale: translation.locale,
            name: translation.name
          });
          await this.adminMenuItemTranslationRepository.save(newTranslation);
        }
      }
    }
    
    // Reload the menu item with translations
    return this.findById(id);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const menuItem = await this.findById(id);
    await this.adminMenuItemRepository.remove(menuItem);
    
    return { success: true };
  }

  async toggleActive(id: number, isActive: boolean): Promise<AdminMenuItem> {
    const menuItem = await this.findById(id);
    
    menuItem.isActive = isActive;
    
    return this.adminMenuItemRepository.save(menuItem);
  }

  async updateOrder(items: { id: number; order: number }[]): Promise<{ success: boolean }> {
    await Promise.all(
      items.map(item => 
        this.adminMenuItemRepository.update(item.id, { order: item.order })
      )
    );
    
    return { success: true };
  }
} 