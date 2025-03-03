import { Controller, Get, Param, Query } from '@nestjs/common';
import { SettingsFrontendService } from '../services/settings-frontend.service';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetMenuItemsQueryDto } from '../dto/menu-item.dto';
import { GetLogosQueryDto } from '../dto/logo.dto';

@ApiTags('settings')
@Controller('settings')
export class SettingsFrontendController {
  constructor(private readonly settingsService: SettingsFrontendService) {}

  // Menu Items
  @Get('menu-items')
  @ApiOperation({ summary: 'Get active menu items' })
  @ApiResponse({ status: 200, description: 'Return active menu items', type: [MenuItem] })
  async getActiveMenuItems(
    @Query() query: GetMenuItemsQueryDto,
  ): Promise<MenuItem[]> {
    const { parentId } = query;
    const filters = {
      ...(parentId !== undefined && { parentId }),
    };
    return this.settingsService.findActiveMenuItems(filters);
  }

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get active menu item by id' })
  @ApiResponse({ status: 200, description: 'Return active menu item by id', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getActiveMenuItemById(@Param('id') id: number): Promise<MenuItem> {
    return this.settingsService.findActiveMenuItemById(id);
  }

  // Logos
  @Get('logos')
  @ApiOperation({ summary: 'Get active logos' })
  @ApiResponse({ status: 200, description: 'Return active logos', type: [Logo] })
  async getActiveLogos(
    @Query() query: GetLogosQueryDto,
  ): Promise<Logo[]> {
    const { type } = query;
    const filters = {
      ...(type !== undefined && { type }),
    };
    return this.settingsService.findActiveLogos(filters);
  }

  @Get('logos/:type')
  @ApiOperation({ summary: 'Get active logo by type' })
  @ApiResponse({ status: 200, description: 'Return active logo by type', type: Logo })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async getActiveLogoByType(@Param('type') type: string): Promise<Logo> {
    return this.settingsService.findActiveLogoByType(type);
  }
} 