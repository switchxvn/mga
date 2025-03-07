import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductTranslation } from './entities/product-translation.entity';
import { ProductAdminController } from './admin/controllers/admin.controller';
import { ProductFrontendController } from './frontend/controllers/frontend.controller';
import { ProductAdminService } from './admin/services/product-admin.service';
import { ProductFrontendService } from './frontend/services/product-frontend.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductTranslation])],
  controllers: [ProductAdminController, ProductFrontendController],
  providers: [ProductAdminService, ProductFrontendService],
  exports: [ProductAdminService, ProductFrontendService],
})
export class ProductModule {} 