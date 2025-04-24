import { router } from '../procedures';
import { dashboardAdminRouter } from './admin/dashboard.router';
import { postAdminRouter } from './admin/post.router';
import { categoryAdminRouter } from './admin/category.router';
import { productAdminRouter } from './admin/product.router';
export const adminRouter = router({
  dashboard: dashboardAdminRouter,
  posts: postAdminRouter,
  categories: categoryAdminRouter,
  products: productAdminRouter,
}); 