import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { AuthService } from '../services/auth.service';
import { User } from '@ew/database';

export async function createContext({ req, res }: CreateExpressContextOptions) {
  async function getUserFromHeader(): Promise<User | null> {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const authService = new AuthService();
        const user = await authService.validateToken(token);
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }

  const user = await getUserFromHeader();

  return {
    req,
    res,
    user,
    authService: new AuthService(),
  };
}

export type Context = inferAsyncReturnType<typeof createContext>; 