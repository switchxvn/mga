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

/**
 * TrpcModule - Main module for tRPC integration with NestJS
 * 
 * This module integrates tRPC with NestJS, allowing for type-safe API calls
 * between the frontend and backend. It imports all necessary modules that
 * will be exposed through tRPC endpoints.
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
  ],
  providers: [TrpcService],
  exports: [TrpcService],
})
export class TrpcModule {} 