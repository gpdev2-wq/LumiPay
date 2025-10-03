import { AdminAuthService } from './admin-auth.service';
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
export declare class AdminManagementController {
    private readonly adminAuthService;
    constructor(adminAuthService: AdminAuthService);
    createAdmin(createAdminDto: CreateAdminDto): Promise<{
        success: boolean;
        message: string;
        admin: {
            email: string;
            role: "admin" | "super_admin";
        };
    }>;
    getAllAdmins(): Promise<{
        success: boolean;
        admins: {
            email: string;
            role: "admin" | "super_admin";
            isActive: boolean;
        }[];
    }>;
    updateAdmin(email: string, updateAdminDto: UpdateAdminDto): Promise<{
        success: boolean;
        message: string;
        admin: {
            email: string;
            role: "admin" | "super_admin";
            isActive: boolean;
        };
    }>;
    deactivateAdmin(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAdminInfo(): Promise<{
        message: string;
        features: string[];
        roles: {
            admin: string;
            super_admin: string;
        };
    }>;
}
export {};
