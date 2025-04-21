import { router } from '../procedures';
import { postRouter } from './post.router';
import { galleryRouter } from './gallery.router';

export const appRouter = router({
  post: postRouter,
  gallery: galleryRouter,
});

export type AppRouter = typeof appRouter; 