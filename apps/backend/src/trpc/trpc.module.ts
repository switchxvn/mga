import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcController } from './trpc.controller';
import { AboutModule } from '../modules/about/about.module';
import { AboutRouter } from '../modules/about/about.router';

@Module({
  imports: [AboutModule],
  controllers: [TrpcController],
  providers: [TrpcService, AboutRouter],
})
export class TrpcModule {} 