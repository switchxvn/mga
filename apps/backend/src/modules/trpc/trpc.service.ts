import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { JwtService } from '@nestjs/jwt';
import { createContext } from './trpc';
import { appRouter } from './routers';
import { authRouter } from './routers/auth.router';
import { postRouter } from './routers/post.router';
import { userRouter } from './routers/user.router';
import { profileRouter } from './routers/profile.router';
import { settingsRouter } from './routers/settings.router';
import { seoRouter } from './routers/seo.router';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/services/profile.service';
import { UserService } from '../user/services/user.service';
import { PostFrontendService } from '../post/frontend/services/post-frontend.service';
import { PostAdminService } from '../post/admin/services/post-admin.service';
import { AuthService } from '../auth/services/auth.service';
import { IAuthService } from '../auth/interfaces/auth.interface';
import { SettingsAdminService } from '../settings/admin/services/settings-admin.service';
import { SettingsFrontendService } from '../settings/frontend/services/settings-frontend.service';
import { SeoAdminService } from '../seo/admin/services/seo-admin.service';
import { SeoFrontendService } from '../seo/frontend/services/seo-frontend.service';
import { FooterAdminService } from '../footer/admin/services/footer-admin.service';
import { FooterFrontendService } from '../footer/frontend/services/footer-frontend.service';
import { footerRouter } from './routers/footer.router';
import { categoryRouter } from './routers/category.router';
import { CategoryFrontendService } from '../category/frontend/services/category-frontend.service';
import { CategoryAdminService } from '../category/admin/services/category-admin.service';
import { serviceRouter } from './routers/service.router';
import { ServiceAdminService } from '../service/admin/services/service-admin.service';
import { ServiceFrontendService } from '../service/frontend/services/service-frontend.service';
import { productRouter } from './routers/product.router';
import { ProductAdminService } from '../product/admin/services/product-admin.service';
import { ProductFrontendService } from '../product/frontend/services/product-frontend.service';
import { CrossSellService } from '../product/frontend/services/cross-sell.service';
import { ProductSpecificationService } from '../product/services/product-specification.service';
import { ProductComboService } from '../product/frontend/services/product-combo.service';
import { priceRequestRouter } from './routers/price-request.router';
import { PriceRequestService } from '../price-request/services/price-request.service';
import { featureFlagsRouter } from './routers/feature-flags.router';
import { FeatureFlagsAdminService } from '../feature-flags/admin/services/feature-flags-admin.service';
import { FeatureFlagsFrontendService } from '../feature-flags/frontend/services/feature-flags-frontend.service';
import { CommonRouter } from './routers/common.router';
import { HeroService } from '../hero/admin/services/hero.service';
import { HeroSliderService } from '../hero/admin/services/hero-slider.service';
import { heroRouter } from './routers/hero.router';

@Injectable()
export class TrpcService {
  private readonly logger = new Logger(TrpcService.name);
  private router;

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
    private readonly commonRouter: CommonRouter,
  ) {
    this.router = appRouter(commonRouter);
  }

  getRouter() {
    return this.router;
  }

  async createContext(req: any) {
    const context = createContext();
    
    // Inject services
    context.services = {
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
    };

    // Extract and verify JWT token if present
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = await this.verifyToken(token);
        
        if (payload && payload.sub) {
          try {
            const user = await this.userService.findOne(payload.sub);
            
            if (user) {
              context.user = {
                id: user.id,
                email: user.email
              };
              this.logger.debug(`User authenticated: ${user.email}`);
            } else {
              this.logger.warn(`User with ID ${payload.sub} not found`);
            }
          } catch (dbError: unknown) {
            this.logger.error(`Database error fetching user: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
          }
        }
      }
    } catch (error: unknown) {
      // Token verification failed, user will remain undefined
      this.logger.warn(`JWT verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return context;
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