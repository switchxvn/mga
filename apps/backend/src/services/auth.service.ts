import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '@ew/database';
import * as bcrypt from 'bcrypt';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginInput) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'username', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const token = this.jwtService.sign({ 
      userId: user.id,
      email: user.email 
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async register({ email, password, name }: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      username: name,
      isActive: true,
      isEmailVerified: false,
    });

    const token = this.jwtService.sign({ 
      userId: user.id,
      email: user.email 
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async logout(userId: number) {
    // Implement token invalidation if needed
    // You might want to add a blacklist for tokens or use Redis
    return true;
  }

  async getCurrentUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'username', 'isActive', 'isEmailVerified', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
} 