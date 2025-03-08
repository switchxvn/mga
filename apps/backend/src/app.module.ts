import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { FooterModule } from './modules/footer/footer.module';
import { PostModule } from './modules/post/post.module';
import { PriceRequestModule } from './modules/price-request/price-request.module';
import { ProductModule } from './modules/product/product.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SeoModule } from './modules/seo/seo.module';
import { ServiceModule } from './modules/service/service.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TrpcModule } from './modules/trpc/trpc.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'ecommerce'),
        autoLoadEntities: true,
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
    PriceRequestModule,
    FeatureFlagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
