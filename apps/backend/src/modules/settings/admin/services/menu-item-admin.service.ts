import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Like } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';
import { MenuItemTranslation } from '../../entities/menu-item-translation.entity';

interface MenuItemsQueryParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean | null;
  locale?: string;
  onlyRootLevel?: boolean;
}

interface MenuItemOrderUpdate {
  id: number;
  order: number;
  parentId: number | null;
}

@Injectable()
export class MenuItemAdminService {
  private readonly logger = new Logger(MenuItemAdminService.name);

  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuItemTranslation)
    private readonly menuItemTranslationRepository: Repository<MenuItemTranslation>,
  ) {}

  async getMenuItem(id: number): Promise<MenuItem | null> {
    return this.menuItemRepository.findOne({
      where: { id },
      relations: ['translations', 'children', 'parent'],
    });
  }

  async getMenuItems(params: MenuItemsQueryParams) {
    const { page, limit, search, isActive, locale, onlyRootLevel } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.menuItemRepository.createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.translations', 'translations')
      .leftJoinAndSelect('menuItem.children', 'children')
      .leftJoinAndSelect('children.translations', 'childTranslations')
      .orderBy('menuItem.order', 'ASC')
      .addOrderBy('children.order', 'ASC');

    // Filter by root level items (no parent) if specified
    if (onlyRootLevel) {
      queryBuilder.where('menuItem.parentId IS NULL');
    }

    // Apply active filter if provided
    if (isActive !== null) {
      if (onlyRootLevel) {
        queryBuilder.andWhere('menuItem.isActive = :isActive', { isActive });
      } else {
        queryBuilder.where('menuItem.isActive = :isActive', { isActive });
      }
    }

    // Apply search filter if provided
    if (search) {
      queryBuilder.andWhere(
        'translations.label ILIKE :search',
        { search: `%${search}%` }
      );
    }

    // Apply locale filter if provided
    if (locale) {
      // Filter parent items by locale
      queryBuilder.andWhere('translations.locale = :locale', { locale });
      
      // For children, we need to use a different approach to avoid filtering out parent items without children
      queryBuilder.andWhere(`(
        NOT EXISTS (SELECT 1 FROM menu_item_translations WHERE menu_item_translations.menu_item_id = children.id)
        OR EXISTS (
          SELECT 1 FROM menu_item_translations 
          WHERE menu_item_translations.menu_item_id = children.id 
          AND menu_item_translations.locale = :locale
        )
      )`, { locale });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async getMenuItemChildren(parentId: number, locale?: string): Promise<MenuItem[]> {
    const queryBuilder = this.menuItemRepository.createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.translations', 'translations')
      .where('menuItem.parentId = :parentId', { parentId })
      .orderBy('menuItem.order', 'ASC');

    // Apply locale filter if provided
    if (locale) {
      // Only show items that have a translation in the specified locale
      queryBuilder.andWhere('translations.locale = :locale', { locale });
    }

    return queryBuilder.getMany();
  }

  async createMenuItem(data: any): Promise<MenuItem> {
    const { translations, ...menuItemData } = data;
    
    // Create the menu item
    const menuItem = this.menuItemRepository.create({
      ...menuItemData,
      level: menuItemData.parentId ? 1 : 0, // Set level based on parent
    });

    // Save the menu item first to get the ID
    const savedMenuItem = await this.menuItemRepository.save(menuItem);

    // Create translations
    if (translations) {
      const translationEntities = [];
      for (const locale in translations) {
        const translationData = translations[locale];
        translationEntities.push(
          this.menuItemTranslationRepository.create({
            menuItemId: savedMenuItem.id,
            locale,
            label: translationData.name,
            href: translationData.url || '#',
          })
        );
      }

      await this.menuItemTranslationRepository.save(translationEntities);
    }

    // Return the complete menu item with translations
    return this.getMenuItem(savedMenuItem.id);
  }

  async updateMenuItem(id: number, data: any): Promise<MenuItem> {
    const { translations, ...menuItemData } = data;
    
    // Find the menu item
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // Update menu item properties
    Object.assign(menuItem, menuItemData);
    
    // Save the updated menu item
    await this.menuItemRepository.save(menuItem);

    // Update translations
    if (translations) {
      for (const locale in translations) {
        const translationData = translations[locale];
        
        // Find existing translation or create new one
        const translation = menuItem.translations.find(t => t.locale === locale);
        
        if (translation) {
          // Update existing translation
          translation.label = translationData.name;
          translation.href = translationData.url || '#';
          await this.menuItemTranslationRepository.save(translation);
        } else {
          // Create new translation
          const newTranslation = this.menuItemTranslationRepository.create({
            menuItemId: id,
            locale,
            label: translationData.name,
            href: translationData.url || '#',
          });
          await this.menuItemTranslationRepository.save(newTranslation);
        }
      }
    }

    // Return the updated menu item with translations
    return this.getMenuItem(id);
  }

  async deleteMenuItem(id: number): Promise<void> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // Check if the menu item has children
    if (menuItem.children && menuItem.children.length > 0) {
      throw new BadRequestException('Cannot delete a menu item that has children. Please delete or move the children first.');
    }

    await this.menuItemRepository.remove(menuItem);
  }

  async updateMenuItemOrder(items: MenuItemOrderUpdate[]): Promise<void> {
    // Use a transaction to ensure all updates are applied or none
    await this.menuItemRepository.manager.transaction(async transactionalEntityManager => {
      for (const item of items) {
        const { id, order, parentId } = item;
        
        // Find the menu item
        const menuItem = await transactionalEntityManager.findOne(MenuItem, {
          where: { id }
        });
        
        if (!menuItem) {
          throw new NotFoundException(`Menu item with ID ${id} not found`);
        }
        
        // Update order and parent
        menuItem.order = order;
        menuItem.parentId = parentId;
        menuItem.level = parentId ? 1 : 0; // Update level based on parent
        
        await transactionalEntityManager.save(MenuItem, menuItem);
      }
    });
  }
} 