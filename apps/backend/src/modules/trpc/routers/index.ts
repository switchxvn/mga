import { router } from '../trpc';
import { authRouter } from './auth.router';
import { postRouter } from './post.router';
import { userRouter } from './user.router';
import { exampleRouter } from './example';
import { settingsRouter } from './settings.router';
import { seoRouter } from './seo.router';
import { categoryRouter } from './category.router';

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  example: exampleRouter,
  settings: settingsRouter,
  seo: seoRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter; 