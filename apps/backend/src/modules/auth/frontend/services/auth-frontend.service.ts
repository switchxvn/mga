import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../user/entities/user.entity';
import { UserProfile } from '../../../profile/entities/user-profile.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from '../../dto/auth.dto';

@Injectable()
export class AuthFrontendService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'isActive'],
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    // Handle both $2y$ (PHP) and $2b$ (Node.js) hashes
    const hashedPassword = user.password.replace('$2y$', '$2b$');
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login time
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const profile = await this.profileRepository.findOne({ where: { userId: user.id } });
    
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: String(user.id),
        email: user.email,
        name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : undefined,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      username: email.split('@')[0], // Use part of email as username
      isActive: true,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Create user profile
    const nameParts = name.split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() : '';
    const firstName = nameParts.join(' ');

    const profile = this.profileRepository.create({
      userId: savedUser.id,
      firstName,
      lastName,
    });
    await this.profileRepository.save(profile);

    return {
      accessToken: this.jwtService.sign({ sub: savedUser.id, email: savedUser.email }),
      user: {
        id: String(savedUser.id),
        email: savedUser.email,
        name: `${firstName} ${lastName}`.trim(),
      },
    };
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'isActive', 'isEmailVerified', 'lastLoginAt'],
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profile = await this.profileRepository.findOne({ where: { userId } });
    return {
      ...user,
      name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : undefined,
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    // In a stateless JWT setup, we don't need to do anything server-side
    // The client should remove the token
    return { success: true };
  }

  generateToken(tokenData: { sub: string; email: string }): string {
    return this.jwtService.sign(tokenData);
  }
} 