import { DataSource } from 'typeorm';
import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostTag } from '../post/entities/post-tag.entity';
import { Tag } from '../settings/entities/tag.entity';
import { ConfigService } from '@nestjs/config';

let dataSource: DataSource | null = null;

async function getDataSource() {
  if (!dataSource) {
    const configService = new ConfigService();
    dataSource = new DataSource({
      type: 'postgres',
      host: configService.get('database.host') || 'localhost',
      port: configService.get('database.port') || 5432,
      username: configService.get('database.username') || 'postgres',
      password: configService.get('database.password') || 'password',
      database: configService.get('database.database') || 'mydb',
      entities: ['dist/apps/backend/src/modules/**/*.entity.js'],
      synchronize: configService.get('database.synchronize') || false,
      logging: configService.get('database.logging') || false,
    });
    await dataSource.initialize();
  }
  return dataSource;
}

export async function createContext({ req, res }: CreateFastifyContextOptions) {
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

  return { 
    req, 
    res, 
    user, 
    dataSource: ds,
    repositories: {
      users: ds.getRepository(User),
      posts: ds.getRepository(Post),
      postTags: ds.getRepository(PostTag),
      tags: ds.getRepository(Tag),
    }
  };
}

export type Context = inferAsyncReturnType<typeof createContext>; 