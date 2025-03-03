import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SettingsAdminService } from '../services/settings-admin.service';
import { MenuItem } from '../../entities/menu-item.entity';
import { Logo } from '../../entities/logo.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
// Tạm thời comment các import không tồn tại
// import { RolesGuard } from '../../../auth/guards/roles.guard';
// import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../dto/menu-item.dto';
import { CreateLogoDto, UpdateLogoDto } from '../dto/logo.dto';

@ApiTags('admin/settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Get menu item by id' })
  @ApiResponse({ status: 200, description: 'Return menu item by id', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getMenuItemById(@Param('id') id: number): Promise<MenuItem> {
    return this.settingsService.findMenuItemById(id);
  }

  @Post('menu-items')
  @ApiOperation({ summary: 'Create menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully', type: MenuItem })
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    return this.settingsService.createMenuItem(createMenuItemDto);
  }

  @Put('menu-items/:id')
  @ApiOperation({ summary: 'Update menu item' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully', type: MenuItem })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async updateMenuItem(
    @Param('id') id: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    return this.settingsService.updateMenuItem(id, updateMenuItemDto);
  }

  @Delete('menu-items/:id')
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete menu item with children' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async deleteMenuItem(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    return this.settingsService.deleteMenuItem(id);
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
  @ApiOperation({ summary: 'Get logo by id' })
  @ApiResponse({ status: 200, description: 'Return logo by id', type: Logo })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async getLogoById(@Param('id') id: number): Promise<Logo> {
    return this.settingsService.findLogoById(id);
  }

  @Post('logos')
  @ApiOperation({ summary: 'Create logo' })
  @ApiResponse({ status: 201, description: 'Logo created successfully', type: Logo })
  async createLogo(@Body() createLogoDto: CreateLogoDto): Promise<Logo> {
    return this.settingsService.createLogo(createLogoDto);
  }

  @Put('logos/:id')
  @ApiOperation({ summary: 'Update logo' })
  @ApiResponse({ status: 200, description: 'Logo updated successfully', type: Logo })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async updateLogo(
    @Param('id') id: number,
    @Body() updateLogoDto: UpdateLogoDto,
  ): Promise<Logo> {
    return this.settingsService.updateLogo(id, updateLogoDto);
  }

  @Delete('logos/:id')
  @ApiOperation({ summary: 'Delete logo' })
  @ApiResponse({ status: 200, description: 'Logo deleted successfully' })
  @ApiResponse({ status: 404, description: 'Logo not found' })
  async deleteLogo(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    return this.settingsService.deleteLogo(id);
  }
} 