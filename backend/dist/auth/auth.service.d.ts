import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(uid: string): Promise<any>;
    generateJwtToken(user: any): Promise<{
        access_token: string;
    }>;
    verifyFirebaseToken(token: string): Promise<import("node_modules/firebase-admin/lib/auth/token-verifier").DecodedIdToken>;
    isAdmin(uid: string): Promise<boolean>;
}
