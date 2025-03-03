import { User } from '../../user/entities/user.entity';
import { LoginInput, RegisterInput } from '../dto/auth.dto';

export interface IAuthService {
  generateToken(user: Partial<User>): string;
  validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null>;
  login(loginInput: LoginInput): Promise<{ accessToken: string; user: Omit<User, 'password'> }>;
  register(registerInput: RegisterInput): Promise<{ accessToken: string; user: Omit<User, 'password'> }>;
  getCurrentUser(userId: number): Promise<User>;
  logout(userId: number): Promise<{ success: boolean }>;
} 