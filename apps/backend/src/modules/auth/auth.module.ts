import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../profile/entities/user-profile.entity';
import { AuthAdminService } from './admin/services/auth-admin.service';
import { AuthFrontendService } from './frontend/services/auth-frontend.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRES_IN', '1d') 
        },
      }),
    }),
    UserModule,
  ],
  providers: [AuthAdminService, AuthFrontendService, JwtStrategy],
  exports: [AuthAdminService, AuthFrontendService, JwtModule],
})
export class AuthModule {} 