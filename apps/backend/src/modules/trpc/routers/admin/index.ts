import { router } from '../../procedures';
import { postAdminRouter } from './post.router';
import { languageAdminRouter } from './language.router';
import { adminMenuItemsRouter } from './menu-items.router';
import { adminFoodMenuRouter } from './food-menu.router';
import { dashboardAdminRouter } from './dashboard.router';

export const adminRouter = router({
  posts: postAdminRouter,
  languages: languageAdminRouter,
  menuItems: adminMenuItemsRouter,
  foodMenu: adminFoodMenuRouter,
  dashboard: dashboardAdminRouter,
}); 