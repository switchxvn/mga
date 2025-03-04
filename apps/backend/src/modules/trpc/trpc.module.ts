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
@Module({
  controllers: [TrpcController],
  imports: [
    UserModule,
    PostModule,
    ProfileModule,
    SettingsModule,
    SeoModule,
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [TrpcService],
  exports: [TrpcService],
})
export class TrpcModule {} 