import { router } from '../../procedures';
import { postAdminRouter } from './post.router';
import { adminMenuItemsRouter } from './menu-items.router';
import { adminFoodMenuRouter } from './food-menu.router';

export const adminRouter = router({
  posts: postAdminRouter,
  menuItems: adminMenuItemsRouter,
  foodMenu: adminFoodMenuRouter,
}); 