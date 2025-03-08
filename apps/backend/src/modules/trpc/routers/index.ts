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
  common: commonRouter.router,
});

export type AppRouter = ReturnType<typeof appRouter>; 