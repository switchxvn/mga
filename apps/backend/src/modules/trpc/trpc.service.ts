import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { JwtService } from '@nestjs/jwt';
import { createContext } from './context';
import { ConfigService } from '@nestjs/config';
import { initTRPC } from '@trpc/server';
import { TRPCContext } from './context';
import { UserService } from '../user/services/user.service';
import { PostFrontendService } from '../post/frontend/services/post-frontend.service';
import { PostAdminService } from '../post/admin/services/post-admin.service';
import { ProfileService } from '../profile/services/profile.service';
import { SettingsAdminService } from '../settings/admin/services/settings-admin.service';
import { SettingsFrontendService } from '../settings/frontend/services/settings-frontend.service';
import { AuthService } from '../auth/services/auth.service';
import { IAuthService } from '../auth/interfaces/auth.interface';
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
import { HeroVideoService } from '../hero/services/hero-video.service';
import { ThemeAdminService } from '../theme/admin/services/theme-admin.service';
import { ThemeFrontendService } from '../theme/frontend/services/theme-frontend.service';
import { ComponentStyleConfigAdminService } from '../theme/admin/services/component-style-config-admin.service';
import { ComponentStyleConfigFrontendService } from '../theme/frontend/services/component-style-config-frontend.service';
import { ITrpcServices } from './interfaces/trpc-services.interface';

@Injectable()
export class TrpcService {
  private readonly logger = new Logger(TrpcService.name);
  private readonly t = initTRPC.context<TRPCContext>().create();
  public readonly router = this.t.router;
  public readonly publicProcedure = this.t.procedure;
  public readonly middleware = this.t.middleware;

  constructor(
    private readonly userService: UserService,
    private readonly postFrontendService: PostFrontendService,
    private readonly postAdminService: PostAdminService,
    private readonly profileService: ProfileService,
    private readonly settingsAdminService: SettingsAdminService,
    private readonly settingsFrontendService: SettingsFrontendService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: IAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly seoAdminService: SeoAdminService,
    private readonly seoFrontendService: SeoFrontendService,
    private readonly footerAdminService: FooterAdminService,
    private readonly footerFrontendService: FooterFrontendService,
    private readonly categoryFrontendService: CategoryFrontendService,
    private readonly categoryAdminService: CategoryAdminService,
    private readonly serviceAdminService: ServiceAdminService,
    private readonly serviceFrontendService: ServiceFrontendService,
    private readonly productAdminService: ProductAdminService,
    private readonly productFrontendService: ProductFrontendService,
    private readonly crossSellService: CrossSellService,
    private readonly productSpecificationService: ProductSpecificationService,
    private readonly productComboService: ProductComboService,
    private readonly priceRequestService: PriceRequestService,
    private readonly featureFlagsAdminService: FeatureFlagsAdminService,
    private readonly featureFlagsFrontendService: FeatureFlagsFrontendService,
    private readonly heroService: HeroService,
    private readonly heroSliderService: HeroSliderService,
    private readonly heroVideoService: HeroVideoService,
    private readonly themeAdminService: ThemeAdminService,
    private readonly themeFrontendService: ThemeFrontendService,
    private readonly componentStyleConfigAdminService: ComponentStyleConfigAdminService,
    private readonly componentStyleConfigFrontendService: ComponentStyleConfigFrontendService,
  ) {}

  public createRouter<TProcRouterRecord extends Record<string, any>>(procedures: TProcRouterRecord) {
    return this.router(procedures);
  }

  async createContext(req: any) {
    const context = await createContext({ req, res: {} as any });
    return {
      ...context,
      services: this.getServices(),
    };
  }

  public getServices(): ITrpcServices {
    return {
      userService: this.userService,
      postService: this.postFrontendService,
      postAdminService: this.postAdminService,
      profileService: this.profileService,
      authService: this.authService,
      settingsAdminService: this.settingsAdminService,
      settingsFrontendService: this.settingsFrontendService,
      seoAdminService: this.seoAdminService,
      seoFrontendService: this.seoFrontendService,
      footerAdminService: this.footerAdminService,
      footerFrontendService: this.footerFrontendService,
      categoryFrontendService: this.categoryFrontendService,
      categoryAdminService: this.categoryAdminService,
      serviceAdminService: this.serviceAdminService,
      serviceFrontendService: this.serviceFrontendService,
      productAdminService: this.productAdminService,
      productFrontendService: this.productFrontendService,
      crossSellService: this.crossSellService,
      productSpecificationService: this.productSpecificationService,
      productComboService: this.productComboService,
      priceRequestService: this.priceRequestService,
      featureFlagsAdminService: this.featureFlagsAdminService,
      featureFlagsFrontendService: this.featureFlagsFrontendService,
      heroService: this.heroService,
      heroSliderService: this.heroSliderService,
      heroVideoService: this.heroVideoService,
      themeAdminService: this.themeAdminService,
      themeFrontendService: this.themeFrontendService,
      componentStyleConfigAdminService: this.componentStyleConfigAdminService,
      componentStyleConfigFrontendService: this.componentStyleConfigFrontendService,
    };
  }

  private async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      return decoded;
    } catch (error: unknown) {
      this.logger.warn(`JWT verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}

// Export the procedures for use in routers
export const { router, procedure: publicProcedure } = initTRPC.context<TRPCContext>().create(); 