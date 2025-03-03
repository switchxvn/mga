import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { RegisterInput, LoginInput } from '../dto/auth.dto';
import { User } from '../../user/entities/user.entity';
import { IAuthService } from '../interfaces/auth.interface';

export interface JwtPayload {
  sub: number;
  email: string;
  name?: string;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  generateToken(user: Partial<User>): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name
    };
    
    return this.jwtService.sign(payload);
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginInput: LoginInput): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.userService.update(user.id, { lastLoginAt: new Date() });

    return {
      accessToken: this.generateToken(user),
      user,
    };
  }

  async register(registerInput: RegisterInput): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const existingUser = await this.userService.findByEmail(registerInput.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerInput.password, 10);
    const newUser = await this.userService.create({
      email: registerInput.email,
      password: hashedPassword,
      name: registerInput.name,
      username: registerInput.name?.toLowerCase().replace(/\s+/g, '_'),
      isActive: true,
      isEmailVerified: false,
    } as CreateUserDto);

    const { password, ...result } = newUser;
    return {
      accessToken: this.generateToken(result),
      user: result,
    };
  }

  async getCurrentUser(userId: number): Promise<User> {
    return this.userService.findOne(userId);
  }

  async logout(userId: number): Promise<{ success: boolean }> {
    // In a stateless JWT setup, we don't need to do anything server-side
    // The client should remove the token
    return { success: true };
  }
} 