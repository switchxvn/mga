import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TRPCError } from '@trpc/server'
import { Role } from '../../entities/role.entity'
import { Permission } from '../../entities/permission.entity'

@Injectable()
export class RoleAdminService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async getAllRoles(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = options
    
    const queryBuilder = this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
    
    if (search) {
      queryBuilder.where('(role.name LIKE :search OR role.description LIKE :search OR role.code LIKE :search)', 
        { search: `%${search}%` })
    }
    
    queryBuilder.orderBy(`role.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
    
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getRoleById(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions']
    })
    
    if (!role) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Không tìm thấy vai trò với ID ${id}`
      })
    }
    
    return role
  }

  async getAllPermissions() {
    return this.permissionRepository.find({
      order: {
        groupName: 'ASC',
        name: 'ASC'
      }
    })
  }

  async createRole(data: {
    name: string
    code: string
    groupName: string
    description?: string
    permissionIds?: string[]
  }) {
    // Kiểm tra xem role đã tồn tại chưa
    const existingRole = await this.roleRepository.findOne({
      where: [
        { name: data.name },
        { code: data.code }
      ]
    })

    if (existingRole) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Tên hoặc mã vai trò đã tồn tại'
      })
    }

    // Tạo role mới
    const role = this.roleRepository.create({
      name: data.name,
      code: data.code,
      groupName: data.groupName,
      description: data.description
    })

    // Thêm permissions nếu có
    if (data.permissionIds && data.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findByIds(data.permissionIds)
      role.permissions = permissions
    }

    // Lưu role
    await this.roleRepository.save(role)
    return role
  }

  async updateRole(id: string, data: {
    name?: string
    code?: string
    groupName?: string
    description?: string
    permissionIds?: string[]
  }) {
    // Lấy role hiện tại
    const role = await this.getRoleById(id)

    // Kiểm tra xem name/code mới đã tồn tại chưa
    if (data.name && data.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: data.name }
      })
      if (existingRole) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Tên vai trò đã tồn tại'
        })
      }
    }

    if (data.code && data.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: data.code }
      })
      if (existingRole) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Mã vai trò đã tồn tại'
        })
      }
    }

    // Cập nhật thông tin cơ bản
    if (data.name) role.name = data.name
    if (data.code) role.code = data.code
    if (data.groupName) role.groupName = data.groupName
    if (data.description !== undefined) role.description = data.description

    // Cập nhật permissions nếu có
    if (data.permissionIds) {
      const permissions = await this.permissionRepository.findByIds(data.permissionIds)
      role.permissions = permissions
    }

    // Lưu role
    await this.roleRepository.save(role)
    return role
  }

  async deleteRole(id: string) {
    const role = await this.getRoleById(id)
    
    await this.roleRepository.remove(role)
    return { success: true }
  }
} 