import { Logger } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from "superjson";
import { IAuthService } from '../auth/interfaces/auth.interface';
import { PostFrontendService } from '../post/frontend/services/post-frontend.service';
import { PostAdminService } from '../post/admin/services/post-admin.service';
import { ProfileService } from '../profile/services/profile.service';
import { UserService } from '../user/services/user.service';
import { SettingsAdminService } from '../settings/admin/services/settings-admin.service';
import { SettingsFrontendService } from '../settings/frontend/services/settings-frontend.service';
import { SeoAdminService } from '../seo/admin/services/seo-admin.service';
import { SeoFrontendService } from '../seo/frontend/services/seo-frontend.service';
import { FooterAdminService } from '../footer/admin/services/footer-admin.service';
import { FooterFrontendService } from '../footer/frontend/services/footer-frontend.service';
import { CategoryFrontendService } from '../category/frontend/services/category-frontend.service';
import { CategoryAdminService } from '../category/admin/services/category-admin.service';
import { ServiceAdminService } from '../service/admin/services/service-admin.service';
import { ServiceFrontendService } from '../service/frontend/services/service-frontend.service';
import { ProductAdminService } from '../product/admin/services/product-admin.service';
import { ProductFrontendService } from '../product/frontend/services/product-frontend.service';
import { CrossSellService } from '../product/frontend/services/cross-sell.service';
import { ProductSpecificationService } from '../product/services/product-specification.service';
import { ProductComboService } from '../product/frontend/services/product-combo.service';
import { PriceRequestService } from '../price-request/services/price-request.service';
import { FeatureFlagsAdminService } from '../feature-flags/admin/services/feature-flags-admin.service';
import { FeatureFlagsFrontendService } from '../feature-flags/frontend/services/feature-flags-frontend.service';
import { HeroService } from '../hero/admin/services/hero.service';
import { HeroSliderService } from '../hero/admin/services/hero-slider.service';
import { ThemeAdminService } from '../theme/admin/services/theme-admin.service';
import { ThemeFrontendService } from '../theme/frontend/services/theme-frontend.service';
import { HeroVideoService } from '../hero/services/hero-video.service';
// Define context type
export interface Context {
  user?: {
    id: number;
    email: string;
  };
  services: {
    userService: UserService;
    postService: PostFrontendService;
    postAdminService: PostAdminService;
    profileService: ProfileService;
    authService: IAuthService;
    settingsAdminService: SettingsAdminService;
    settingsFrontendService: SettingsFrontendService;
    seoAdminService: SeoAdminService;
    seoFrontendService: SeoFrontendService;
    footerAdminService: FooterAdminService;
    footerFrontendService: FooterFrontendService;
    categoryFrontendService: CategoryFrontendService;
    categoryAdminService: CategoryAdminService;
    serviceAdminService: ServiceAdminService;
    serviceFrontendService: ServiceFrontendService;
    productAdminService: ProductAdminService;
    productFrontendService: ProductFrontendService;
    crossSellService: CrossSellService;
    productSpecificationService: ProductSpecificationService;
    productComboService: ProductComboService;
    priceRequestService: PriceRequestService;
    featureFlagsAdminService: FeatureFlagsAdminService;
    featureFlagsFrontendService: FeatureFlagsFrontendService;
    heroService: HeroService;
    heroSliderService: HeroSliderService;
    themeAdminService: ThemeAdminService;
    themeFrontendService: ThemeFrontendService;
    heroVideoService: HeroVideoService;
  };
  logger: Logger;
}

// Create empty context
const createContext = (): Context => ({
  services: {} as any, // Will be injected by NestJS
  logger: new Logger('tRPC'),
});

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        httpStatus: shape.data.httpStatus,
        stack: error.stack,
        cause: error.cause instanceof Error ? error.cause.message : error.cause,
      },
    };
  },
});

// Create middleware for protected routes
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  
  ctx.logger.log(`Authenticated user accessing protected route: ${ctx.user.email}`);
  
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Create middleware for admin routes
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  
  // Kiểm tra quyền admin ở đây (có thể cần thêm logic)
  // Ví dụ: if (ctx.user.role !== 'ADMIN') throw new TRPCError({...})
  
  ctx.logger.log(`Admin user accessing protected route: ${ctx.user.email}`);
  
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Export reusable router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);

// Export context creator
export { createContext };
