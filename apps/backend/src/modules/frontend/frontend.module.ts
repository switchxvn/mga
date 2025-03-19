import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '@ecommerce/database';
import { FrontendServiceService } from './services/service.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
  ],
  providers: [FrontendServiceService],
  exports: [FrontendServiceService],
})
export class FrontendModule {} 