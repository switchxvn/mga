import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrpcModule } from '../trpc/trpc.module';
import { DatabaseModule } from '@ew/database';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    DatabaseModule,
    ServicesModule,
    TrpcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
