import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserService } from './services/user.service';
import { UserAdminController } from './admin/controllers/admin.controller';
import { UserFrontendController } from './frontend/controllers/frontend.controller';
import { UserAdminService } from './admin/services/user-admin.service';
import { UserFrontendService } from './frontend/services/user-frontend.service';
import { AdminUserService } from './admin/services/user.service';
import { UserProfile } from '../profile/entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, UserProfile])],
  controllers: [UserAdminController, UserFrontendController],
  providers: [UserService, UserAdminService, UserFrontendService, AdminUserService],
  exports: [UserService, UserAdminService, UserFrontendService, AdminUserService],
})
export class UserModule {} 