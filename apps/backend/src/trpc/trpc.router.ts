import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { FooterRouter } from './routers/footer.router';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly footerRouter: FooterRouter,
  ) {}

  router = this.trpc.router({
    footer: this.footerRouter.router,
  });
} 