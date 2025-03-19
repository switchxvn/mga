import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service, ServiceTranslation } from '@ecommerce/database';
import { AdminServiceService } from './services/service.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceTranslation]),
  ],
  providers: [AdminServiceService],
  exports: [AdminServiceService],
})
export class AdminModule {} 