import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { ProductRouter } from '../product/trpc/product.router';
import { CategoryRouter } from '../category/trpc/category.router';
import { UserRouter } from '../user/trpc/user.router';
import { AuthRouter } from '../auth/trpc/auth.router';
import { priceRequestRouter } from './routers/price-request.router';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly productRouter: ProductRouter,
    private readonly categoryRouter: CategoryRouter,
    private readonly userRouter: UserRouter,
    private readonly authRouter: AuthRouter,
  ) {}

  router = this.trpc.router({
    product: this.productRouter.router,
    category: this.categoryRouter.router,
    user: this.userRouter.router,
    auth: this.authRouter.router,
    priceRequest: priceRequestRouter,
  });
}

export type AppRouter = TrpcRouter['router']; 