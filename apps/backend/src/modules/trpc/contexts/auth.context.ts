import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../user/entities/user.entity';
import { AppModule } from '../../../app.module';
import { DataSourceContext } from './datasource.context';

@Injectable()
export class AuthContext {
  private static jwtService: JwtService | null = null;
  private readonly logger = new Logger('AuthContext');

  constructor(private readonly dataSourceContext: DataSourceContext) {}

  private async getJwtService(): Promise<JwtService> {
    if (!AuthContext.jwtService) {
      const app = await AppModule.getApp();
      AuthContext.jwtService = app.get(JwtService);
    }
    return AuthContext.jwtService;
  }

  public async authenticateUser(authHeader: string | undefined): Promise<User | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    try {
      const token = authHeader.substring(7);
      const jwt = await this.getJwtService();
      const decoded = await jwt.verify(token);

      if (!decoded?.sub) {
        return null;
      }

      const ds = await this.dataSourceContext.getDataSource();
      const userRepository = ds.getRepository(User);
      const user = await userRepository.findOne({
        where: {
          id: decoded.sub,
          isActive: true
        }
      });

      if (user) {
        this.logger.log(`Authenticated user: ${user.email}`);
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to verify token:', error);
      return null;
    }
  }
} 