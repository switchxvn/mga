import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { themeRouter } from './routers/theme.router';
import { authRouter } from './routers/auth.router';
import { postRouter } from './routers/post.router';
import { userRouter } from './routers/user.router';
import { profileRouter } from './routers/profile.router';
import { settingsRouter } from './routers/settings.router';
import { seoRouter } from './routers/seo.router';
import { footerRouter } from './routers/footer.router';
import { categoryRouter } from './routers/category.router';
import { serviceRouter } from './routers/service.router';
import { productRouter } from './routers/product.router';
import { priceRequestRouter } from './routers/price-request.router';
import { featureFlagsRouter } from './routers/feature-flags.router';
import { heroRouter } from './routers/hero.router';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
  ) {}

  public getRouter() {
    return this.trpc.createRouter({
      theme: themeRouter,
      auth: authRouter,
      post: postRouter,
      user: userRouter,
      profile: profileRouter,
      settings: settingsRouter,
      seo: seoRouter,
      footer: footerRouter,
      category: categoryRouter,
      service: serviceRouter,
      product: productRouter,
      priceRequest: priceRequestRouter,
      featureFlags: featureFlagsRouter,
      hero: heroRouter,
    });
  }
}

export type AppRouter = ReturnType<TrpcRouter['getRouter']>; 