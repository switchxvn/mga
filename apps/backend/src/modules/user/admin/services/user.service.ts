import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { compare, hash } from 'bcrypt'
import { TRPCError } from '@trpc/server'

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async updateName(userId: string, name: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy người dùng'
      })
    }

    await this.userRepository.save(user)

    return user
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Không tìm thấy người dùng'
      })
    }

    const isPasswordValid = await compare(currentPassword, user.password)
    
    if (!isPasswordValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Mật khẩu hiện tại không đúng'
      })
    }

    user.password = await hash(newPassword, 10)
    await this.userRepository.save(user)

    return user
  }
} 