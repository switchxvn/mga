import { Module, forwardRef } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { ProfileModule } from '../profile/profile.module';
import { AuthModule } from '../auth/auth.module';
import { SettingsModule } from '../settings/settings.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TrpcController } from './trpc.controller';
import { SeoModule } from '../seo/seo.module';
import { FooterModule } from '../footer/footer.module';
import { CategoryModule } from '../category/category.module';
import { ServiceModule } from '../service/service.module';
import { ProductModule } from '../product/product.module';
import { PriceRequestModule } from '../price-request/price-request.module';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module';
import { HeroModule } from '../hero/hero.module';
import { CommonModule } from '../common';
import { CommonRouter } from './routers/common.router';
import { TrpcRouter } from './trpc.router';
import { ThemeModule } from '../theme/theme.module';
import { LanguageModule } from '../language/language.module';
import { AboutModule } from '../about/about.module';
import { CustomerLogoModule } from '../customer-logo/customer-logo.module';
import { ContactModule } from '../contact/contact.module';
import { GalleryModule } from '../gallery/gallery.module';
import { TicketPricingModule } from '../ticket-pricing/ticket-pricing.module';
import { OrderTicketModule } from '../order-ticket/order-ticket.module';
import { FoodMenuModule } from '../food-menu/food-menu.module';
import { PaymentModule } from '../payment/payment.module';
import { OrderModule } from '../order/order.module';
import { UploadModule } from '../upload/upload.module';
/**
 * TrpcModule - Main module for tRPC integration with NestJS
 * 
 * This module integrates tRPC with NestJS, allowing for type-safe API calls
 * between the frontend and backend. It imports all necessary modules that
 * will be exposed through tRPC endpoints.
 * 
 * Features:
 * - User management and authentication
 * - Content management (posts, products, categories)
 * - Site configuration (settings, SEO, footer)
 * - Theme management and customization
 * - Feature flags for conditional functionality
 * - Language and translation management
 * - About page management
 * - Customer logos management
 */
@Module({
  controllers: [TrpcController],
  imports: [
    // Feature modules that will be exposed through tRPC
    UserModule,
    PostModule,
    ProfileModule,
    SettingsModule,
    SeoModule,
    FooterModule,
    CategoryModule,
    ServiceModule,
    ProductModule,
    PriceRequestModule,
    FeatureFlagsModule,
    HeroModule,
    CommonModule,
    ThemeModule,
    LanguageModule,
    AboutModule,
    CustomerLogoModule,
    AuthModule,
    ContactModule,
    GalleryModule,
    TicketPricingModule,
    OrderTicketModule,
    FoodMenuModule,
    OrderModule,
    UploadModule,
    forwardRef(() => PriceRequestModule),
    
    // Auth module is imported with forwardRef to avoid circular dependency
    forwardRef(() => AuthModule),
    
    // JWT configuration for authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
      }),
      inject: [ConfigService],
    }),
    
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PaymentModule,
  ],
  providers: [
    TrpcService,
    CommonRouter,
    TrpcRouter,
  ],
  exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {} 