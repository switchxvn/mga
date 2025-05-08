import { router } from '../../procedures'
import { postAdminRouter } from './post.router'
import { languageAdminRouter } from './language.router'
import { adminMenuItemsRouter } from './menu-items.router'
import { adminFoodMenuRouter } from './food-menu.router'
import { dashboardAdminRouter } from './dashboard.router'
import { categoryAdminRouter } from './category.router'
import { usersAdminRouter } from './users.router'
import { productAdminRouter } from './product.router'
import { orderAdminRouter } from './order.router'
import { adminCommentRouter } from './comment.router'
import { adminReviewRouter } from './review.router'
import { adminSiteStatisticsRouter } from './site-statistics.router'
import { galleryAdminRouter } from './gallery.router'
import { themeAdminRouter } from './theme.router'
import { themeSectionAdminRouter } from './theme-section.router'

export const adminRouter = router({
  posts: postAdminRouter,
  languages: languageAdminRouter,
  menuItems: adminMenuItemsRouter,
  foodMenu: adminFoodMenuRouter,
  dashboard: dashboardAdminRouter,
  category: categoryAdminRouter,
  users: usersAdminRouter,
  products: productAdminRouter,
  order: orderAdminRouter,
  comments: adminCommentRouter,
  review: adminReviewRouter,
  siteStatistics: adminSiteStatisticsRouter,
  galleries: galleryAdminRouter,
  theme: themeAdminRouter,
  themeSection: themeSectionAdminRouter,
}) 