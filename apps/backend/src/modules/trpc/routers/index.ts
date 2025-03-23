import { router } from '../trpc';
import { authRouter } from './auth.router';
import { postRouter } from './post.router';
import { userRouter } from './user.router';
import { exampleRouter } from './example';
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

export const appRouter = (commonRouter) => router({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  example: exampleRouter,
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
});

export type AppRouter = ReturnType<typeof appRouter>; 