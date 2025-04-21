import { Injectable, Logger } from '@nestjs/common';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ServiceContext } from './service.context';
import { DataSourceContext } from './datasource.context';
import { AuthContext } from './auth.context';

export type TRPCContext = {
  req: CreateFastifyContextOptions['req'];
  res: CreateFastifyContextOptions['res'];
  user: User | null;
  dataSource: DataSource | null;
  logger: Logger;
  services: ReturnType<ServiceContext['getServices']>;
};

@Injectable()
export class TRPCContextManager {
  private readonly logger = new Logger('tRPC');

  constructor(
    private readonly serviceContext: ServiceContext,
    private readonly dataSourceContext: DataSourceContext,
    private readonly authContext: AuthContext,
  ) {}

  async createContext({ req, res }: any): Promise<TRPCContext> {
    const ds = await this.dataSourceContext.getDataSource();
    const user = await this.authContext.authenticateUser(req.headers.authorization);
    return {
      req,
      res,
      user,
      dataSource: ds,
      logger: this.logger,
      services: this.serviceContext.getServices(),
    };
  }
} 