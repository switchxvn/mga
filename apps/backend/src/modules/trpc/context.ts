import { Logger } from '@nestjs/common';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostTag } from '../post/entities/post-tag.entity';
import { Tag } from '../settings/entities/tag.entity';
import { Theme } from '../theme/entities/theme.entity';
import { ThemeSection } from '../theme/entities/theme-section.entity';
import { ThemeAdminService } from '../theme/admin/services/theme-admin.service';
import { ThemeFrontendService } from '../theme/frontend/services/theme-frontend.service';

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
      entities: [User, Post, PostTag, Tag, Theme, ThemeSection],
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
  repositories: {
    users: DataSource['getRepository'];
    posts: DataSource['getRepository'];
    postTags: DataSource['getRepository'];
    tags: DataSource['getRepository'];
    themes: DataSource['getRepository'];
    themeSections: DataSource['getRepository'];
  };
  services: {
    themeAdminService: ThemeAdminService;
    themeFrontendService: ThemeFrontendService;
    // ... other services
  };
};

export async function createContext({ req, res }: CreateFastifyContextOptions): Promise<TRPCContext> {
  const ds = await getDataSource();
  const jwtService = new JwtService({ 
    secret: process.env.JWT_SECRET || 'your-secret-key'
  });
  
  let user: User | null = null;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwtService.verify(token);
      if (decoded && ds) {
        user = await ds.getRepository(User).findOne({
          where: { id: decoded.sub },
          relations: ['posts'],
        });
      }
    }
  } catch (error) {
    console.error('JWT verification failed:', error);
  }

  const themeRepository = ds?.getRepository(Theme);
  const themeSectionRepository = ds?.getRepository(ThemeSection);
  const themeAdminService = new ThemeAdminService(themeRepository, themeSectionRepository);
  const themeFrontendService = new ThemeFrontendService(themeRepository);

  return { 
    req, 
    res, 
    user, 
    dataSource: ds,
    logger: new Logger('tRPC'),
    repositories: {
      users: ds?.getRepository.bind(ds, User),
      posts: ds?.getRepository.bind(ds, Post),
      postTags: ds?.getRepository.bind(ds, PostTag),
      tags: ds?.getRepository.bind(ds, Tag),
      themes: ds?.getRepository.bind(ds, Theme),
      themeSections: ds?.getRepository.bind(ds, ThemeSection),
    },
    services: {
      themeAdminService,
      themeFrontendService,
      // Add other services as needed
    }
  };
} 