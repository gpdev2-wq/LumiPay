import { AdminAuthService } from './admin-auth.service';
export declare class AdminAuthController {
    private readonly adminAuthService;
    constructor(adminAuthService: AdminAuthService);
    adminLogin(loginDto: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string | undefined;
        admin: {
            email: string | undefined;
            role: "admin" | "super_admin" | undefined;
        };
        message: string;
    }>;
    verifyAdmin(): Promise<{
        message: string;
        timestamp: string;
    }>;
    adminLogout(): Promise<{
        message: string;
    }>;
}
