import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends CreateUserDto {}

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginInput: LoginInput) {
    const { email, password } = loginInput;
    const user = await this.validateUser(email, password);

    // Update last login timestamp
    await this.userService.update(user.id, { lastLoginAt: new Date() });

    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerInput: RegisterInput) {
    const existingUser = await this.userService.findByEmail(registerInput.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const user = await this.userService.create(registerInput);
    const { password: _, ...result } = user;

    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: result,
    };
  }

  async getCurrentUser(userId: number) {
    return this.userService.findOne(userId);
  }

  async logout(userId: number) {
    // In a stateless JWT setup, we don't need to do anything server-side
    // The client should remove the token
    return { success: true };
  }
} 