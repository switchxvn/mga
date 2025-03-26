import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { UserProfile } from '../../../profile/entities/user-profile.entity';

@Injectable()
export class AuthAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    private readonly jwtService: JwtService,
  ) {}

  generateToken(tokenData: { sub: number; email: string }): string {
    return this.jwtService.sign(tokenData);
  }
} 