import { Logger } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { User } from '../user/entities/user.entity';
import { ITrpcServices } from './interfaces/trpc-services.interface';

let dataSource: DataSource | null = null;

async function getDataSource() {
  if (!dataSource) {
    const app = await AppModule.getApp();
    dataSource = app.get(getDataSourceToken());
  }
  return dataSource;
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

  return {
    req,
    res,
    user: null,
    dataSource: ds,
    logger,
    services: {} as ITrpcServices, // Services will be injected by NestJS
  };
} 