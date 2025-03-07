import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceRequest } from './entities/price-request.entity';
import { PriceRequestService } from './services/price-request.service';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceRequest, Product]),
  ],
  providers: [PriceRequestService],
  exports: [PriceRequestService],
})
export class PriceRequestModule {} 