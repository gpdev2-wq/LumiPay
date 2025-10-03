import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminManagementController } from './admin-management.controller';
import { AdminAuthService } from './admin-auth.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AdminController, AdminAuthController, AdminManagementController],
  providers: [AdminAuthService],
})
export class AdminModule {}


