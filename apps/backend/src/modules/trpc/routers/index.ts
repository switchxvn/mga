import { router } from '../trpc';
import { authRouter } from './auth.router';
import { postRouter } from './post.router';
import { userRouter } from './user.router';
import { exampleRouter } from './example';

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  example: exampleRouter,
});

export type AppRouter = typeof appRouter; 