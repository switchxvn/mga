import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductTranslation } from './entities/product-translation.entity';
import { CrossSellProduct } from './entities/cross-sell-product.entity';
import { ProductSpecification } from './entities/product-specification.entity';
import { ProductSpecificationTranslation } from './entities/product-specification-translation.entity';
import { ProductCombo } from './entities/product-combo.entity';
import { ProductAdminController } from './admin/controllers/admin.controller';
import { ProductFrontendController } from './frontend/controllers/frontend.controller';
import { ProductAdminService } from './admin/services/product-admin.service';
import { ProductFrontendService } from './frontend/services/product-frontend.service';
import { CrossSellService } from './frontend/services/cross-sell.service';
import { ProductSpecificationService } from './services/product-specification.service';
import { ProductComboService } from './frontend/services/product-combo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, 
      ProductTranslation, 
      CrossSellProduct,
      ProductSpecification,
      ProductSpecificationTranslation,
      ProductCombo
    ])
  ],
  controllers: [ProductAdminController, ProductFrontendController],
  providers: [
    ProductAdminService, 
    ProductFrontendService, 
    CrossSellService,
    ProductSpecificationService,
    ProductComboService
  ],
  exports: [
    ProductAdminService, 
    ProductFrontendService, 
    CrossSellService,
    ProductSpecificationService,
    ProductComboService
  ],
})
export class ProductModule {} 