import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class TrpcService {
  private readonly logger = new Logger(TrpcService.name);
  private appRouter = router({
    auth: authRouter,
    post: postRouter,
    user: userRouter,
  });

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly jwtService: JwtService,
  ) {}

  getRouter() {
    return this.appRouter;
  }

  async createContext(req: any) {
    const context = createContext();
    
    // Inject repositories
    context.repositories = {
      users: this.userRepository,
      posts: this.postRepository,
    };

    // Extract and verify JWT token if present
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify(token);
        
        if (payload && payload.sub) {
          try {
            const user = await this.userRepository.findOne({
              where: { id: payload.sub },
              select: ['id', 'email', 'name'],
            });
            
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
          } catch (dbError) {
            this.logger.error(`Database error fetching user: ${dbError.message}`);
          }
        }
      }
    } catch (error) {
      // Token verification failed, user will remain undefined
      this.logger.warn(`JWT verification failed: ${error.message}`);
    }

    return context;
  }
} 