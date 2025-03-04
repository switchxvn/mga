import { Injectable } from '@nestjs/common';
import { router } from './trpc';
import { userRouter } from './routers/user.router';
import { postRouter } from './routers/post.router';
import { seoRouter } from './routers/seo.router';

@Injectable()
export class TrpcRouter {
  public readonly appRouter = router({
    user: userRouter,
    post: postRouter,
    seo: seoRouter,
  });
}

export type AppRouter = TrpcRouter['appRouter']; 