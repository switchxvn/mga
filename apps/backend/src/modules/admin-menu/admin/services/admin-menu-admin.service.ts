import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminMenuItem } from '../../entities/admin-menu-item.entity';

@Injectable()
export class AdminMenuAdminService {
  private readonly logger = new Logger(AdminMenuAdminService.name);

  constructor(
    @InjectRepository(AdminMenuItem)
    private readonly adminMenuItemRepository: Repository<AdminMenuItem>
  ) {}

  async findAll(options?: { includeInactive?: boolean }): Promise<AdminMenuItem[]> {
    const { includeInactive = false } = options || {};
    
    return this.adminMenuItemRepository.find({
      where: includeInactive ? {} : { isActive: true },
      relations: ['parent', 'children'],
      order: { order: 'ASC' }
    });
  }

  async findById(id: number): Promise<AdminMenuItem> {
    const menuItem = await this.adminMenuItemRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });

    if (!menuItem) {
      throw new NotFoundException(`Admin menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async findByCode(code: string): Promise<AdminMenuItem | null> {
    return this.adminMenuItemRepository.findOne({
      where: { code },
      relations: ['parent', 'children']
    });
  }

  async create(createAdminMenuItemDto: Partial<AdminMenuItem>): Promise<AdminMenuItem> {
    const adminMenuItem = this.adminMenuItemRepository.create(createAdminMenuItemDto);
    return this.adminMenuItemRepository.save(adminMenuItem);
  }

  async update(id: number, updateAdminMenuItemDto: Partial<AdminMenuItem>): Promise<AdminMenuItem> {
    const menuItem = await this.findById(id);
    
    // Update the menuItem with the dto values
    Object.assign(menuItem, updateAdminMenuItemDto);
    
    return this.adminMenuItemRepository.save(menuItem);
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