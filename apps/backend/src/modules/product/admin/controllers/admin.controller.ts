import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductAdminService } from '../services/product-admin.service';
import { Product } from '../../entities/product.entity';
import { ProductTranslation } from '../../entities/product-translation.entity';

@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly productAdminService: ProductAdminService) {}

  @Get()
  findAll() {
    return this.productAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productAdminService.findOne(+id);
  }

  @Post()
  create(@Body() productData: Partial<Product>) {
    return this.productAdminService.create(productData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() productData: Partial<Product>) {
    return this.productAdminService.update(+id, productData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productAdminService.remove(+id);
  }

  @Post('translation')
  createTranslation(@Body() translation: Partial<ProductTranslation>) {
    return this.productAdminService.createTranslation(translation);
  }

  @Patch('translation/:id')
  updateTranslation(@Param('id') id: string, @Body() translation: Partial<ProductTranslation>) {
    return this.productAdminService.updateTranslation(+id, translation);
  }

  @Delete('translation/:id')
  removeTranslation(@Param('id') id: string) {
    return this.productAdminService.removeTranslation(+id);
  }
} 