import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../../profile/entities/user-profile.entity';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { compare } from 'bcrypt';
import { hash } from 'bcrypt';
import { TRPCError } from '@trpc/server';

@Injectable()
export class UserAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>
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

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
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
        'roles.permissions'
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

  async updateName(userId: string, name: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy người dùng'
      })
    }

    let profile = await this.profileRepository.findOne({ where: { userId } })
    
    if (!profile) {
      profile = this.profileRepository.create({
        userId,
        firstName: name
      })
    } else {
      profile.firstName = name
    }

    await this.profileRepository.save(profile)

    return user
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    console.log('user', user)
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy người dùng'
      })
    }

    console.log('currentPassword', currentPassword)

    // const isPasswordValid = await compare(currentPassword, user.password)


    user.password = await hash(newPassword, 10)
    await this.userRepository.save(user)

    return user
  }
} 