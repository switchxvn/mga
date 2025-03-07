import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductFrontendService } from '../services/product-frontend.service';

@Controller('products')
export class ProductFrontendController {
  constructor(private readonly productFrontendService: ProductFrontendService) {}

  @Get()
  findAll(@Query('locale') locale: string = 'en') {
    return this.productFrontendService.findAll(locale);
  }

  @Get('featured')
  findFeatured(@Query('locale') locale: string = 'en') {
    return this.productFrontendService.findFeatured(locale);
  }

  @Get('new')
  findNew(@Query('locale') locale: string = 'en') {
    return this.productFrontendService.findNew(locale);
  }

  @Get('sale')
  findOnSale(@Query('locale') locale: string = 'en') {
    return this.productFrontendService.findOnSale(locale);
  }

  @Get(':id')
  findById(@Param('id') id: string, @Query('locale') locale: string = 'en') {
    return this.productFrontendService.findById(+id, locale);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Query('locale') locale: string = 'en') {
    return this.productFrontendService.findBySlug(slug, locale);
  }
} 