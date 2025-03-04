import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { JwtService } from '@nestjs/jwt';
import { createContext } from './trpc';
import { router } from './trpc';
import { authRouter } from './routers/auth.router';
import { postRouter } from './routers/post.router';
import { userRouter } from './routers/user.router';
import { profileRouter } from './routers/profile.router';
import { settingsRouter } from './routers/settings.router';
import { seoRouter } from './routers/seo.router';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/services/profile.service';
import { UserService } from '../user/services/user.service';
import { PostService } from '../post/services/post.service';
import { AuthService } from '../auth/services/auth.service';
import { IAuthService } from '../auth/interfaces/auth.interface';
import { SettingsAdminService } from '../settings/admin/services/settings-admin.service';
import { SettingsFrontendService } from '../settings/frontend/services/settings-frontend.service';
import { SeoAdminService } from '../seo/admin/services/seo-admin.service';
import { SeoFrontendService } from '../seo/frontend/services/seo-frontend.service';

@Injectable()
export class TrpcService {
  private readonly logger = new Logger(TrpcService.name);
  private appRouter = router({
    auth: authRouter,
    post: postRouter,
    user: userRouter,
    profile: profileRouter,
    settings: settingsRouter,
    seo: seoRouter,
  });

  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly profileService: ProfileService,
    private readonly settingsAdminService: SettingsAdminService,
    private readonly settingsFrontendService: SettingsFrontendService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: IAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly seoAdminService: SeoAdminService,
    private readonly seoFrontendService: SeoFrontendService,
  ) {}

  getRouter() {
    return this.appRouter;
  }

  async createContext(req: any) {
    const context = createContext();
    
    // Inject services
    context.services = {
      userService: this.userService,
      postService: this.postService,
      profileService: this.profileService,
      authService: this.authService,
      settingsAdminService: this.settingsAdminService,
      settingsFrontendService: this.settingsFrontendService,
      seoAdminService: this.seoAdminService,
      seoFrontendService: this.seoFrontendService,
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
                email: user.email,
                name: user.name || '',
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