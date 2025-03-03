import { router } from '../trpc';
import { authRouter } from './auth.router';
import { postRouter } from './post.router';
import { userRouter } from './user.router';
import { exampleRouter } from './example';
import { settingsRouter } from './settings.router';

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  example: exampleRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter; 