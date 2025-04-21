import { Injectable } from '@nestjs/common';
import { CommonRouter } from './routers/common.router';
import { router } from './procedures/index';
import {
  themeRouter,
  authRouter,
  postRouter,
  userRouter,
  profileRouter,
  settingsRouter,
  seoRouter,
  footerRouter,
  categoryRouter,
  serviceRouter,
  productRouter,
  priceRequestRouter,
  featureFlagsRouter,
  heroRouter,
  componentStyleConfigRouter,
  languageRouter,
  aboutRouter,
  logoRouter,
  customerLogoRouter,
  contactRouter,
  galleryRouter,
  contactSectionRouter,
  ticketPricingSectionRouter,
  orderTicketSectionRouter,
  foodMenuRouter,
  paymentRouter,
  orderRouter,
  uploadRouter,
  adminMenuItemsRouter,
  adminFoodMenuRouter,
} from './routers';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly commonRouter: CommonRouter,
  ) {}

  public getRouter() {
    return router({
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
      componentStyleConfig: componentStyleConfigRouter,
      common: this.commonRouter.router,
      language: languageRouter,
      about: aboutRouter,
      logo: logoRouter,
      customerLogo: customerLogoRouter,
      contact: contactRouter,
      gallery: galleryRouter,
      contactSection: contactSectionRouter,
      ticketPricingSection: ticketPricingSectionRouter,
      orderTicketSection: orderTicketSectionRouter,
      foodMenu: foodMenuRouter,
      payment: paymentRouter,
      order: orderRouter,
      upload: uploadRouter,
      admin: router({
        menuItems: adminMenuItemsRouter,
        foodMenu: adminFoodMenuRouter,
      }),
    });
  }

  public router = this.getRouter();
}

export type AppRouter = ReturnType<TrpcRouter['getRouter']>; 