import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

interface CreateAdminDto {
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
}

interface UpdateAdminDto {
  email?: string;
  role?: 'admin' | 'super_admin';
  isActive?: boolean;
}

@Controller('admin/management')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminManagementController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('create')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    try {
      const { email, password, role } = createAdminDto;
      
      // Validate input
      if (!email || !password || !role) {
        throw new BadRequestException('Email, password, and role are required');
      }

      if (!email.includes('@')) {
        throw new BadRequestException('Invalid email format');
      }

      if (password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters');
      }

      if (!['admin', 'super_admin'].includes(role)) {
        throw new BadRequestException('Role must be admin or super_admin');
      }

      const newAdmin = await this.adminAuthService.createAdmin(email, password, role);
      
      return {
        success: true,
        message: 'Admin created successfully',
        admin: {
          email: newAdmin.email,
          role: newAdmin.role,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create admin');
    }
  }

  @Get('list')
  async getAllAdmins() {
    try {
      const admins = await this.adminAuthService.getAllAdmins();
      return {
        success: true,
        admins: admins.map(admin => ({
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
        })),
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch admins');
    }
  }

  @Put('update/:email')
  async updateAdmin(@Param('email') email: string, @Body() updateAdminDto: UpdateAdminDto) {
    try {
      const updated = await this.adminAuthService.updateAdmin(email, updateAdminDto);
      
      if (!updated) {
        throw new BadRequestException('Admin not found');
      }

      return {
        success: true,
        message: 'Admin updated successfully',
        admin: {
          email: updated.email,
          role: updated.role,
          isActive: updated.isActive,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to update admin');
    }
  }

  @Delete('deactivate/:email')
  async deactivateAdmin(@Param('email') email: string) {
    try {
      const deactivated = await this.adminAuthService.deactivateAdmin(email);
      
      if (!deactivated) {
        throw new BadRequestException('Admin not found');
      }

      return {
        success: true,
        message: 'Admin deactivated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to deactivate admin');
    }
  }

  @Get('info')
  async getAdminInfo() {
    return {
      message: 'Admin management system',
      features: [
        'Create new admin accounts',
        'List all admins',
        'Update admin roles',
        'Deactivate admin accounts',
        'Role-based permissions',
      ],
      roles: {
        admin: 'Standard admin access',
        super_admin: 'Full system access including admin management',
      },
    };
  }
}
