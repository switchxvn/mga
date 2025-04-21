import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { CommonRouter } from './routers/common.router';
import * as routers from './routers';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly commonRouter: CommonRouter,
  ) {}

  public getRouter() {
    return this.trpc.createRouter({
      theme: routers.themeRouter,
      auth: routers.authRouter,
      post: routers.postRouter,
      user: routers.userRouter,
      profile: routers.profileRouter,
      settings: routers.settingsRouter,
      seo: routers.seoRouter,
      footer: routers.footerRouter,
      category: routers.categoryRouter,
      service: routers.serviceRouter,
      product: routers.productRouter,
      priceRequest: routers.priceRequestRouter,
      featureFlags: routers.featureFlagsRouter,
      hero: routers.heroRouter,
      componentStyleConfig: routers.componentStyleConfigRouter,
      common: this.commonRouter.router,
      language: routers.languageRouter,
      about: routers.aboutRouter,
      logo: routers.logoRouter,
      customerLogo: routers.customerLogoRouter,
      contact: routers.contactRouter,
      gallery: routers.galleryRouter,
      contactSection: routers.contactSectionRouter,
      ticketPricingSection: routers.ticketPricingSectionRouter,
      orderTicketSection: routers.orderTicketSectionRouter,
      foodMenu: routers.foodMenuRouter,
      payment: routers.paymentRouter,
      order: routers.orderRouter,
      upload: routers.uploadRouter,
      admin: this.trpc.createRouter({
        menuItems: routers.adminMenuItemsRouter,
        foodMenu: routers.adminFoodMenuRouter,
      }),
    });
  }

  public router = this.getRouter();
}

export type AppRouter = ReturnType<TrpcRouter['getRouter']>; 