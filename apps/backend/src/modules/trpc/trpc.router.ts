import { Injectable } from '@nestjs/common';
import { router } from './trpc';
import { userRouter } from './routers/user.router';
import { postRouter } from './routers/post.router';
import { seoRouter } from './routers/seo.router';
import { footerRouter } from './routers/footer.router';

@Injectable()
export class TrpcRouter {
  public readonly appRouter = router({
    user: userRouter,
    post: postRouter,
    seo: seoRouter,
    footer: footerRouter,
  });
}

export type AppRouter = TrpcRouter['appRouter']; 