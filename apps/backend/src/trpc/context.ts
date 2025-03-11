import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { FastifyRequest } from 'fastify';
import { AppModule } from '../app.module';
import { PostFrontendService } from '../modules/post/frontend/services/post-frontend.service';
import { PostAdminService } from '../modules/post/admin/services/post-admin.service';

export async function createContext({ req }: CreateFastifyContextOptions) {
  const app = await AppModule.getApp();
  const postFrontendService = app.get(PostFrontendService);
  const postAdminService = app.get(PostAdminService);

  return {
    req,
    services: {
      postFrontendService,
      postAdminService,
      // ... other services
    },
  };
}

export type Context = inferAsyncReturnType<typeof createContext>; 