import { Logger } from '@nestjs/common';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostTag } from '../post/entities/post-tag.entity';
import { Tag } from '../settings/entities/tag.entity';
import { Theme } from '../theme/entities/theme.entity';
import { ThemeSection } from '../theme/entities/theme-section.entity';
import { ThemeAdminService } from '../theme/admin/services/theme-admin.service';
import { ThemeFrontendService } from '../theme/frontend/services/theme-frontend.service';
import { HeroVideoService } from '../hero/services/hero-video.service';
import { HeroService } from '../hero/admin/services/hero.service';
import { HeroSliderService } from '../hero/admin/services/hero-slider.service';
import { HeroVideo } from '../hero/entities/hero-video.entity';
import { Hero } from '../hero/entities/hero.entity';
import { HeroSlider } from '../hero/entities/hero-slider.entity';
import { PostTranslation } from '../post/entities/post-translation.entity';
import { PostFrontendService } from '../post/frontend/services/post-frontend.service';
import { PostAdminService } from '../post/admin/services/post-admin.service';
import { ProfileService } from '../profile/services/profile.service';
import { UserProfile } from '../profile/entities/user-profile.entity';
import { CountryPhoneCode } from '../common/entities/country-phone-code.entity';
import { UserService } from '../user/services/user.service';
import { IAuthService } from '../auth/interfaces/auth.interface';
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

let dataSource: DataSource | null = null;

async function getDataSource() {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Post, PostTag, Tag, Theme, ThemeSection, PostTranslation, UserProfile, CountryPhoneCode, Hero, HeroVideo, HeroSlider],
      synchronize: false,
    });
    await dataSource.initialize();
  }
  return dataSource;
}

export type TRPCContext = {
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
  user: User | null;
  dataSource: DataSource | null;
  logger: Logger;
  repositories: {
    users: Repository<User>;
    posts: Repository<Post>;
    postTags: Repository<PostTag>;
    tags: Repository<Tag>;
    themes: Repository<Theme>;
    themeSections: Repository<ThemeSection>;
    postTranslation: Repository<PostTranslation>;
    countryPhoneCodes: Repository<CountryPhoneCode>;
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
    heroVideoService: HeroVideoService;
    themeAdminService: ThemeAdminService;
    themeFrontendService: ThemeFrontendService;
  };
};

export async function createContext({ req, res }: CreateFastifyContextOptions): Promise<TRPCContext> {
  const ds = await getDataSource();
  const logger = new Logger('tRPC');

  const userRepository = ds.getRepository(User);
  const postRepository = ds.getRepository(Post);
  const postTagRepository = ds.getRepository(PostTag);
  const tagRepository = ds.getRepository(Tag);
  const themeRepository = ds.getRepository(Theme);
  const themeSectionRepository = ds.getRepository(ThemeSection);
  const postTranslationRepository = ds.getRepository(PostTranslation);
  const profileRepository = ds.getRepository(UserProfile);
  const heroVideoRepository = ds.getRepository(HeroVideo);
  const heroRepository = ds.getRepository(Hero);
  const heroSliderRepository = ds.getRepository(HeroSlider);
  const countryPhoneCodeRepository = ds.getRepository(CountryPhoneCode);

  return {
    req,
    res,
    user: null,
    dataSource: ds,
    logger,
    repositories: {
      users: userRepository,
      posts: postRepository,
      postTags: postTagRepository,
      tags: tagRepository,
      themes: themeRepository,
      themeSections: themeSectionRepository,
      postTranslation: postTranslationRepository,
      countryPhoneCodes: countryPhoneCodeRepository,
    },
    services: {} as any, // Services will be injected by NestJS
  };
} 