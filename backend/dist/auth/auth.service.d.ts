import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(uid: string): Promise<any>;
    generateJwtToken(user: any): Promise<{
        access_token: any;
    }>;
    verifyFirebaseToken(token: string): Promise<any>;
    isAdmin(uid: string): Promise<boolean>;
}
