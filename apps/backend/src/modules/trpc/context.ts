import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getDataSourceToken } from '@nestjs/typeorm';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { User } from '../user/entities/user.entity';
import { ITrpcServices } from './interfaces/trpc-services.interface';

let dataSource: DataSource | null = null;
let jwtService: JwtService | null = null;

async function getDataSource() {
  if (!dataSource) {
    const app = await AppModule.getApp();
    dataSource = app.get(getDataSourceToken());
  }
  return dataSource;
}

async function getJwtService() {
  if (!jwtService) {
    const app = await AppModule.getApp();
    jwtService = app.get(JwtService);
  }
  return jwtService;
}

export type TRPCContext = {
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
  user: User | null;
  dataSource: DataSource | null;
  logger: Logger;
  services: ITrpcServices;
};

export async function createContext({ req, res }: CreateFastifyContextOptions): Promise<TRPCContext> {
  const ds = await getDataSource();
  const logger = new Logger('tRPC');
  const jwt = await getJwtService();

  let user = null;

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify and decode token
      const decoded = await jwt.verify(token);
      
      // Get user from database
      if (decoded && decoded.sub) {
        const userRepository = ds.getRepository(User);
        user = await userRepository.findOne({ 
          where: { 
            id: decoded.sub,
            isActive: true 
          }
        });

        if (user) {
          logger.log(`Authenticated user: ${user.email}`);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to verify token:', error);
  }

  return {
    req,
    res,
    user,
    dataSource: ds,
    logger,
    services: {} as ITrpcServices,
  };
} 