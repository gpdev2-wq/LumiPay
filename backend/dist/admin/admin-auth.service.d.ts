import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
interface Admin {
    email: string;
    password: string;
    role: 'admin' | 'super_admin';
    isActive: boolean;
}
export declare class AdminAuthService {
    private jwtService;
    private usersService;
    private readonly admins;
    constructor(jwtService: JwtService, usersService: UsersService);
    validateAdmin(email: string, password: string): Promise<{
        success: boolean;
        message?: string;
        token?: string;
        admin?: Admin;
    }>;
    isAdmin(email: string): Promise<boolean>;
    getAdminByEmail(email: string): Promise<Admin | null>;
    createAdmin(email: string, password: string, role?: 'admin' | 'super_admin'): Promise<Admin>;
    updateAdmin(email: string, updates: {
        email?: string;
        role?: 'admin' | 'super_admin';
        isActive?: boolean;
    }): Promise<Admin | null>;
    deactivateAdmin(email: string): Promise<boolean>;
    getAllAdmins(): Promise<Admin[]>;
}
export {};
