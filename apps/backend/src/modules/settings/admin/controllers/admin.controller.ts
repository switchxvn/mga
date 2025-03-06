import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SettingsAdminService } from '../services/settings-admin.service';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';
import { Tag } from '../../entities/tag.entity';
// import { RolesGuard } from '../../../auth/guards/roles.guard';
// import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('admin/settings')
@Controller('admin/settings')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@ApiBearerAuth()
export class SettingsAdminController {
  constructor(private readonly settingsService: SettingsAdminService) {}

  // Menu Items
  @Get('menu-items')
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, description: 'Return all menu items', type: [MenuItem] })
  async getAllMenuItems(
    @Query('parentId') parentId?: number,
    @Query('isActive') isActive?: boolean,
  ): Promise<MenuItem[]> {
    const filters = {
      ...(parentId !== undefined && { parentId }),
      ...(isActive !== undefined && { isActive: isActive === true }),
    };
    return this.settingsService.findAllMenuItems(filters);
  }

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiResponse({ status: 200, description: 'Return the menu item', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getMenuItemById(@Param('id') id: number): Promise<MenuItem> {
    return this.settingsService.findMenuItemById(id);
  }

  @Post('menu-items')
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, description: 'The menu item has been created', type: MenuItem })
  async createMenuItem(@Body() data: CreateMenuItem): Promise<MenuItem> {
    return this.settingsService.createMenuItem(data);
  }

  @Put('menu-items/:id')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiResponse({ status: 200, description: 'The menu item has been updated', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async updateMenuItem(
    @Param('id') id: number,
    @Body() data: UpdateMenuItem,
  ): Promise<MenuItem> {
    return this.settingsService.updateMenuItem(id, data);
  }

  @Delete('menu-items/:id')
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiResponse({ status: 200, description: 'The menu item has been deleted' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async deleteMenuItem(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    await this.settingsService.deleteMenuItem(id);
    return { success: true, message: `Menu item with ID ${id} deleted successfully` };
  }

  // Logos
  @Get('logos')
  @ApiOperation({ summary: 'Get all logos' })
  @ApiResponse({ status: 200, description: 'Return all logos', type: [Logo] })
  async getAllLogos(
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<Logo[]> {
    const filters = {
      ...(type !== undefined && { type }),
      ...(isActive !== undefined && { isActive: isActive === true }),
    };
    return this.settingsService.findAllLogos(filters);
  }

  @Get('logos/:id')
  @ApiOperation({ summary: 'Get a logo by ID' })
  @ApiResponse({ status: 200, description: 'Return the logo', type: Logo })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async getLogoById(@Param('id') id: number): Promise<Logo> {
    return this.settingsService.findLogoById(id);
  }

  @Post('logos')
  @ApiOperation({ summary: 'Create a new logo' })
  @ApiResponse({ status: 201, description: 'The logo has been created', type: Logo })
  async createLogo(@Body() data: CreateLogo): Promise<Logo> {
    return this.settingsService.createLogo(data);
  }

  @Put('logos/:id')
  @ApiOperation({ summary: 'Update a logo' })
  @ApiResponse({ status: 200, description: 'The logo has been updated', type: Logo })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async updateLogo(
    @Param('id') id: number,
    @Body() data: UpdateLogo,
  ): Promise<Logo> {
    return this.settingsService.updateLogo(id, data);
  }

  @Delete('logos/:id')
  @ApiOperation({ summary: 'Delete a logo' })
  @ApiResponse({ status: 200, description: 'The logo has been deleted' })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async deleteLogo(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    await this.settingsService.deleteLogo(id);
    return { success: true, message: `Logo with ID ${id} deleted successfully` };
  }

  // Tags
  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Return all tags', type: [Tag] })
  async getAllTags(
    @Query('isActive') isActive?: boolean,
  ): Promise<Tag[]> {
    const filters = {
      ...(isActive !== undefined && { isActive: isActive === true }),
    };
    return this.settingsService.findAllTags(filters);
  }

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiResponse({ status: 200, description: 'Return the tag', type: Tag })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getTagById(@Param('id') id: number): Promise<Tag> {
    return this.settingsService.findTagById(id);
  }

  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'The tag has been created', type: Tag })
  async createTag(@Body() data: CreateTag): Promise<Tag> {
    return this.settingsService.createTag(data);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiResponse({ status: 200, description: 'The tag has been updated', type: Tag })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async updateTag(
    @Param('id') id: number,
    @Body() data: UpdateTag,
  ): Promise<Tag> {
    return this.settingsService.updateTag(id, data);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiResponse({ status: 200, description: 'The tag has been deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async deleteTag(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    await this.settingsService.deleteTag(id);
    return { success: true, message: `Tag with ID ${id} deleted successfully` };
  }
} 