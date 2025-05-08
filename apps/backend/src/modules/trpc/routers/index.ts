import { authRouter } from './auth.router';
import { postRouter } from './post.router';
import { userRouter } from './user.router';
import { settingsRouter } from './settings.router';
import { seoRouter } from './seo.router';
import { categoryRouter } from './category.router';
import { serviceRouter } from './service.router';
import { featureFlagsRouter } from './feature-flags.router';
import { productRouter } from './product.router';
import { priceRequestRouter } from './price-request.router';
import { profileRouter } from './profile.router';
import { footerRouter } from './footer.router';
import { heroRouter } from './hero.router';
import { themeRouter } from './theme.router';
import { languageRouter } from './language.router';
import { componentStyleConfigRouter } from './component-style-config.router';
import { logoRouter } from './logo.router';
import { customerLogoRouter } from './customer-logo.router';
import { contactRouter } from './contact.router';
import { aboutRouter } from './about.router';
import { galleryRouter } from './gallery.router';
import { foodMenuRouter } from './food-menu.router';
import { contactSectionRouter } from './contact-section.router';
import { ticketPricingSectionRouter } from './ticket-pricing-section.router';
import { orderTicketSectionRouter } from './order-ticket-section.router';
import { paymentRouter } from './payment.router';
import { orderRouter } from './order.router';
import { uploadRouter } from './upload.router';
import { commentRouter } from './comment.router';
import { reviewRouter } from './review.router';
import { adminRouter } from './admin';
import { router } from '../procedures';
import { siteStatisticsRouter } from './site-statistics.router';

// Re-export all routers
export {
  authRouter,
  postRouter,
  userRouter,
  settingsRouter,
  seoRouter,
  categoryRouter,
  serviceRouter,
  featureFlagsRouter,
  productRouter,
  priceRequestRouter,
  profileRouter,
  footerRouter,
  heroRouter,
  themeRouter,
  languageRouter,
  componentStyleConfigRouter,
  logoRouter,
  customerLogoRouter,
  contactRouter,
  aboutRouter,
  galleryRouter,
  foodMenuRouter,
  contactSectionRouter,
  ticketPricingSectionRouter,
  orderTicketSectionRouter,
  paymentRouter,
  orderRouter,
  uploadRouter,
  commentRouter,
  reviewRouter,
  adminRouter,
  siteStatisticsRouter,
};

export const appRouter = (commonRouter) => router({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  settings: settingsRouter,
  seo: seoRouter,
  category: categoryRouter,
  service: serviceRouter,
  featureFlags: featureFlagsRouter,
  product: productRouter,
  priceRequest: priceRequestRouter,
  profile: profileRouter,
  footer: footerRouter,
  hero: heroRouter,
  theme: themeRouter,
  common: commonRouter.router,
  language: languageRouter,
  componentStyleConfig: componentStyleConfigRouter,
  logo: logoRouter,
  customerLogo: customerLogoRouter,
  contact: contactRouter,
  about: aboutRouter,
  gallery: galleryRouter,
  foodMenu: foodMenuRouter,
  contactSection: contactSectionRouter,
  ticketPricingSection: ticketPricingSectionRouter,
  orderTicketSection: orderTicketSectionRouter,
  payment: paymentRouter,
  order: orderRouter,
  upload: uploadRouter,
  comment: commentRouter,
  review: reviewRouter,
  admin: adminRouter,
  siteStatistics: siteStatisticsRouter,
});

export type AppRouter = ReturnType<typeof appRouter>; 