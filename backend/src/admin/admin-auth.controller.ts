import { Controller, Post, Get, Body, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async adminLogin(@Body() loginDto: { email: string; password: string }) {
    try {
      const result = await this.adminAuthService.validateAdmin(loginDto.email, loginDto.password);
      
      if (!result.success) {
        throw new UnauthorizedException(result.message);
      }

      return {
        access_token: result.token,
        admin: {
          email: result.admin.email,
          role: result.admin.role,
        },
        message: 'Admin authentication successful',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid admin credentials');
    }
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async verifyAdmin() {
    return {
      message: 'Admin access verified',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminLogout() {
    // In a real implementation, you might want to blacklist the token
    return {
      message: 'Admin logged out successfully',
    };
  }
}
