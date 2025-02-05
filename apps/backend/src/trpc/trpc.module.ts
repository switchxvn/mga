import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TrpcController } from './trpc.controller';

@Module({
  controllers: [TrpcController],
})
export class TrpcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply any additional middleware if needed
    consumer
      .apply()
      .forRoutes('trpc');
  }
} 