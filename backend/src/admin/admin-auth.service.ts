import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

interface Admin {
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
}

@Injectable()
export class AdminAuthService {
  private readonly admins: Admin[] = [
    {
      email: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super_admin',
      isActive: true,
    },
    // Add more admins as needed
  ];

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<{
    success: boolean;
    message?: string;
    token?: string;
    admin?: Admin;
  }> {
    try {
      // Find admin by email
      const admin = this.admins.find(a => a.email === email && a.isActive);
      
      if (!admin) {
        return {
          success: false,
          message: 'Invalid admin credentials',
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password) || password === admin.password;
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid admin credentials',
        };
      }

      // Generate JWT token
      const payload = {
        email: admin.email,
        role: admin.role,
        sub: admin.email,
        type: 'admin',
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '8h', // Admin tokens expire in 8 hours
      });

      // Log admin login
      console.log(`🔐 Admin login: ${admin.email} at ${new Date().toISOString()}`);

      return {
        success: true,
        token,
        admin: {
          email: admin.email,
          password: admin.password,
          role: admin.role,
          isActive: admin.isActive,
        },
      };
    } catch (error) {
      console.error('Admin validation error:', error);
      return {
        success: false,
        message: 'Authentication failed',
      };
    }
  }

  async isAdmin(email: string): Promise<boolean> {
    const admin = this.admins.find(a => a.email === email && a.isActive);
    return !!admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | null> {
    return this.admins.find(a => a.email === email && a.isActive) || null;
  }

  async createAdmin(email: string, password: string, role: 'admin' | 'super_admin' = 'admin'): Promise<Admin> {
    // Check if admin already exists
    const existingAdmin = this.admins.find(a => a.email === email);
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin: Admin = {
      email,
      password: hashedPassword,
      role,
      isActive: true,
    };

    this.admins.push(newAdmin);
    
    console.log(`👤 New admin created: ${email} with role: ${role}`);
    
    return {
      email: newAdmin.email,
      password: newAdmin.password,
      role: newAdmin.role,
      isActive: newAdmin.isActive,
    };
  }

  async updateAdmin(email: string, updates: { email?: string; role?: 'admin' | 'super_admin'; isActive?: boolean }): Promise<Admin | null> {
    const admin = this.admins.find(a => a.email === email);
    if (!admin) {
      return null;
    }

    if (updates.email && updates.email !== email) {
      // Check if new email already exists
      const existingAdmin = this.admins.find(a => a.email === updates.email);
      if (existingAdmin) {
        throw new Error('Admin with this email already exists');
      }
      admin.email = updates.email;
    }

    if (updates.role) {
      admin.role = updates.role;
    }

    if (updates.isActive !== undefined) {
      admin.isActive = updates.isActive;
    }

    console.log(`👤 Admin updated: ${email}`);
    
    return {
      email: admin.email,
      password: admin.password,
      role: admin.role,
      isActive: admin.isActive,
    };
  }

  async deactivateAdmin(email: string): Promise<boolean> {
    const admin = this.admins.find(a => a.email === email);
    if (admin) {
      admin.isActive = false;
      console.log(`🚫 Admin deactivated: ${email}`);
      return true;
    }
    return false;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return this.admins.map(admin => ({
      email: admin.email,
      password: admin.password,
      role: admin.role,
      isActive: admin.isActive,
    }));
  }
}
