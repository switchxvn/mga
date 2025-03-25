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

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserAdminController, UserFrontendController],
  providers: [UserService, UserAdminService, UserFrontendService],
  exports: [UserService, UserAdminService, UserFrontendService],
})
export class UserModule {} 