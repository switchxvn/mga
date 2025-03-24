export const ROUTE_NAMES = {
  // Products
  PRODUCTS_LIST: {
    en: 'products',
    vi: 'san-pham'
  },
  PRODUCT_DETAIL: {
    en: 'products-detail',
    vi: 'san-pham-chi-tiet'
  },
  // Posts
  POSTS_LIST: {
    en: 'posts',
    vi: 'bai-viet'
  },
  POST_DETAIL: {
    en: 'posts-detail',
    vi: 'bai-viet-chi-tiet'
  },
  // Services
  SERVICES_LIST: {
    en: 'services',
    vi: 'dich-vu'
  },
  SERVICE_DETAIL: {
    en: 'services-detail',
    vi: 'dich-vu-chi-tiet'
  },
  // Categories
  CATEGORIES_LIST: {
    en: 'categories',
    vi: 'danh-muc-san-pham'
  },
  CATEGORY_DETAIL: {
    en: 'categories-detail',
    vi: 'danh-muc-san-pham-chi-tiet'
  }
} as const;

export const ROUTE_PATHS = {
  // Products
  PRODUCTS_LIST: {
    en: '/products',
    vi: '/san-pham'
  },
  PRODUCT_DETAIL: {
    en: '/products/:slug',
    vi: '/san-pham/:slug'
  },
  // Posts
  POSTS_LIST: {
    en: '/posts',
    vi: '/bai-viet'
  },
  POST_DETAIL: {
    en: '/posts/:slug',
    vi: '/bai-viet/:slug'
  },
  // Services
  SERVICES_LIST: {
    en: '/services',
    vi: '/dich-vu'
  },
  SERVICE_DETAIL: {
    en: '/services/:slug',
    vi: '/dich-vu/:slug'
  },
  // Categories
  CATEGORIES_LIST: {
    en: '/categories',
    vi: '/danh-muc-san-pham'
  },
  CATEGORY_DETAIL: {
    en: '/categories/:slug',
    vi: '/danh-muc-san-pham/:slug'
  }
} as const;

export type LocaleType = 'en' | 'vi';
type RouteType = keyof typeof ROUTE_PATHS;

/**
 * Get localized route path
 * @param routeType - Type of route from ROUTE_PATHS
 * @param locale - Current locale
 * @param params - Route parameters (e.g., slug)
 */
export function getLocalizedRoute(routeType: RouteType, locale: LocaleType, params?: Record<string, string>): string {
  let path = ROUTE_PATHS[routeType][locale];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  
  return path;
}

/**
 * Get localized route name
 * @param routeType - Type of route from ROUTE_NAMES
 * @param locale - Current locale
 */
export function getLocalizedRouteName(routeType: RouteType, locale: LocaleType): string {
  return ROUTE_NAMES[routeType][locale];
} 