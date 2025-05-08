import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminMenuItem } from '../../entities/admin-menu-item.entity';

@Injectable()
export class AdminMenuFrontendService {
  private readonly logger = new Logger(AdminMenuFrontendService.name);

  constructor(
    @InjectRepository(AdminMenuItem)
    private readonly adminMenuItemRepository: Repository<AdminMenuItem>
  ) {}

  async findAllActive(): Promise<AdminMenuItem[]> {
    return this.adminMenuItemRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { order: 'ASC' }
    });
  }

  async getMenuForRole(roleCode?: string): Promise<AdminMenuItem[]> {
    // Create query to get all active menu items
    const queryBuilder = this.adminMenuItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.children', 'children')
      .where('item.isActive = :isActive', { isActive: true })
      .andWhere('item.parentId IS NULL') // Get only root items
      .orderBy('item.order', 'ASC')
      .addOrderBy('children.order', 'ASC');

    // If role code is provided, filter by role access
    if (roleCode) {
      queryBuilder.andWhere('(item.availableForRoles IS NULL OR item.availableForRoles LIKE :rolePattern)', {
        rolePattern: `%${roleCode}%`
      });
      
      // Also filter children by role access
      queryBuilder.andWhere('(children.availableForRoles IS NULL OR children.availableForRoles LIKE :rolePattern)', {
        rolePattern: `%${roleCode}%`
      });
    }

    const items = await queryBuilder.getMany();

    // Filter out empty parent categories
    return items.filter(item => {
      if (!item.children || item.children.length === 0) {
        // Include item if it has a path (is a direct link)
        return !!item.path;
      }
      
      // For parent items, only include if they have at least one visible child
      return item.children.some(child => child.isActive);
    });
  }

  async findByCode(code: string): Promise<AdminMenuItem | null> {
    return this.adminMenuItemRepository.findOne({
      where: { code, isActive: true }
    });
  }
} 