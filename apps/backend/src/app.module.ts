import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { TrpcModule } from './modules/trpc/trpc.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SeoModule } from './modules/seo/seo.module';
import { FooterModule } from './modules/footer/footer.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CategoryModule } from './modules/category/category.module';
import { ServiceModule } from './modules/service/service.module';
import { ProductModule } from './modules/product/product.module';
import { User } from './modules/user/entities/user.entity';
import { Post } from './modules/post/entities/post.entity';
import { MenuItem } from './modules/settings/entities/menu-item.entity';
import { Logo } from './modules/settings/entities/logo.entity';
import { Seo } from './modules/seo/entities/seo.entity';
import { Footer } from './modules/footer/entities/footer.entity';
import { UserProfile } from './modules/profile/entities/user-profile.entity';
import { CountryPhoneCode } from './modules/common/entities/country-phone-code.entity';
import { Category } from './modules/category/entities/category.entity';
import { PostTag } from './modules/post/entities/post-tag.entity';
import { Tag } from './modules/settings/entities/tag.entity';
import { Service } from './modules/service/entities/service.entity';
import { Product } from './modules/product/entities/product.entity';
import { ProductTranslation } from './modules/product/entities/product-translation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : 'apps/backend/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'nestjs'),
        entities: [User, Post, MenuItem, Logo, Seo, Footer, UserProfile, CountryPhoneCode, Category, PostTag, Tag, Service, Product, ProductTranslation],
        synchronize: false,
        logging: true,
      }),
    }),
    UserModule,
    AuthModule,
    PostModule,
    TrpcModule,
    SettingsModule,
    SeoModule,
    FooterModule,
    ProfileModule,
    CategoryModule,
    ServiceModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
