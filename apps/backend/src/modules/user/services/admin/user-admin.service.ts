import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../../profile/entities/user-profile.entity';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../../entities/role.entity';
import { TRPCError } from '@trpc/server';

export interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
}

@Injectable()
export class UserAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUsers(params: GetUsersParams): Promise<PaginatedResult<User>> {
    const { page, limit, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build query conditions
    const where: any = {};
    if (search) {
      where.email = Like(`%${search}%`);
      // Có thể thêm nhiều điều kiện khác với OR
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with pagination
    const [items, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['roles', 'profile'],
    });

    return {
      items,
      total,
      limit,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['roles', 'profile']
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneWithPermissions(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'permissions',
        'roles',
        'roles.permissions',
        'profile'
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id.toString());
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateName(userId: string, name: string): Promise<User> {
    const user = await this.findOne(userId);
    user.username = name;
    return this.userRepository.save(user);
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<User> {
    // Tìm user với password (cần select thêm password)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password', 'username']
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Mật khẩu hiện tại không chính xác',
      });
    }

    // Cập nhật mật khẩu mới
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    // Loại bỏ password khi trả về kết quả
    const { password, ...result } = user;
    return result as User;
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.findOne(userId);
    const roles = await this.roleRepository.findByIds(roleIds);
    
    user.roles = roles;
    return this.userRepository.save(user);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }
} 