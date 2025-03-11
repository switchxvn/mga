import { Logger } from '@nestjs/common';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostTag } from '../post/entities/post-tag.entity';
import { Tag } from '../settings/entities/tag.entity';
import { Theme } from '../theme/entities/theme.entity';
import { ThemeSection } from '../theme/entities/theme-section.entity';
import { PostTranslation } from '../post/entities/post-translation.entity';
import { UserProfile } from '../profile/entities/user-profile.entity';
import { CountryPhoneCode } from '../common/entities/country-phone-code.entity';
import { Hero } from '../hero/entities/hero.entity';
import { HeroVideo } from '../hero/entities/hero-video.entity';
import { HeroSlider } from '../hero/entities/hero-slider.entity';
import { Category } from '../category/entities/category.entity';
import { ITrpcServices } from './interfaces/trpc-services.interface';

let dataSource: DataSource | null = null;

async function getDataSource() {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Post, PostTag, Tag, Theme, ThemeSection, PostTranslation, UserProfile, CountryPhoneCode, Hero, HeroVideo, HeroSlider, Category],
      synchronize: false,
    });
    await dataSource.initialize();
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