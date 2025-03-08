import { Controller, Get, Param, Query } from '@nestjs/common';
import { SettingsFrontendService } from '../services/settings-frontend.service';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';
import { Tag } from '../../entities/tag.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetMenuItemsQueryDto } from '../dto/menu-item.dto';
import { GetLogosQueryDto } from '../dto/logo.dto';
import { GetTagsQueryDto } from '../dto/tag.dto';
import { Settings } from '../../entities/settings.entity';

@ApiTags('settings')
@Controller('settings')
export class SettingsFrontendController {
  constructor(private readonly settingsService: SettingsFrontendService) {}

  // Menu Items
  @Get('menu-items')
  @ApiOperation({ summary: 'Get all active menu items' })
  @ApiResponse({ status: 200, description: 'Return all active menu items', type: [MenuItem] })
  async getActiveMenuItems(@Query() query: GetMenuItemsQueryDto): Promise<MenuItem[]> {
    return this.settingsService.findActiveMenuItems(query);
  }

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get an active menu item by ID' })
  @ApiResponse({ status: 200, description: 'Return the active menu item', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getActiveMenuItemById(@Param('id') id: number): Promise<MenuItem> {
    return this.settingsService.findActiveMenuItemById(id);
  }

  // Logos
  @Get('logos')
  @ApiOperation({ summary: 'Get all active logos' })
  @ApiResponse({ status: 200, description: 'Return all active logos', type: [Logo] })
  async getActiveLogos(@Query() query: GetLogosQueryDto): Promise<Logo[]> {
    return this.settingsService.findActiveLogos(query);
  }

  @Get('logos/type/:type')
  @ApiOperation({ summary: 'Get an active logo by type' })
  @ApiResponse({ status: 200, description: 'Return the active logo', type: Logo })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async getActiveLogoByType(@Param('type') type: string): Promise<Logo> {
    return this.settingsService.findActiveLogoByType(type);
  }

  // Tags
  @Get('tags')
  @ApiOperation({ summary: 'Get all active tags' })
  @ApiResponse({ status: 200, description: 'Return all active tags', type: [Tag] })
  async getActiveTags(@Query() query: GetTagsQueryDto): Promise<Tag[]> {
    return this.settingsService.findActiveTags(query);
  }

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get an active tag by ID' })
  @ApiResponse({ status: 200, description: 'Return the active tag', type: Tag })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getActiveTagById(@Param('id') id: number): Promise<Tag> {
    return this.settingsService.findActiveTagById(id);
  }

  @Get('tags/slug/:slug')
  @ApiOperation({ summary: 'Get an active tag by slug' })
  @ApiResponse({ status: 200, description: 'Return the active tag', type: Tag })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getActiveTagBySlug(@Param('slug') slug: string): Promise<Tag> {
    return this.settingsService.findActiveTagBySlug(slug);
  }

  // Settings endpoints
  @Get('config')
  async getPublicSettings(): Promise<Settings[]> {
    return this.settingsService.getPublicSettings();
  }

  @Get('config/:key')
  async getPublicSettingByKey(@Param('key') key: string): Promise<Settings> {
    return this.settingsService.getPublicSettingByKey(key);
  }

  @Get('config/group/:group')
  async getPublicSettingsByGroup(@Param('group') group: string): Promise<Settings[]> {
    return this.settingsService.getPublicSettingsByGroup(group);
  }
} 