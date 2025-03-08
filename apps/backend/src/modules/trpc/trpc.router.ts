import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { CommonRouter } from './routers/common.router';
import { appRouter } from './routers';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly commonRouter: CommonRouter,
  ) {}

  getRouter() {
    return appRouter(this.commonRouter);
  }
}

export type AppRouter = ReturnType<typeof appRouter>; 