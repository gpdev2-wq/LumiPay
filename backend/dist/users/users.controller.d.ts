import { UsersService } from './users.service';
import type { User } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(userData: Omit<User, 'id' | 'totalOrders' | 'totalVolume' | 'status' | 'createdAt'>): Promise<User>;
    createOrUpdateUser(body: {
        uid: string;
        email: string;
        displayName?: string;
        phoneNumber?: string;
    }): Promise<User>;
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | undefined>;
    getUserByUid(uid: string): Promise<User | undefined>;
    updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    updateUserStats(uid: string, body: {
        totalOrders: number;
        totalVolume: number;
    }): Promise<User | undefined>;
    syncUsersFromFirebase(): Promise<{
        message: string;
        usersCount: number;
    }>;
    syncUserFromFirebase(uid: string): Promise<User | undefined>;
    getFirebaseStatus(): Promise<{
        connected: boolean;
        error?: string;
        usersCount?: number;
    }>;
    getTestMock(): Promise<{
        message: string;
        users: any[];
    }>;
    getTestSimple(): Promise<{
        message: string;
        timestamp: string;
    }>;
    getReferralStats(id: string): Promise<{
        referralCount: number;
        referralEarnings: number;
        referrals: User[];
    }>;
    processReferral(body: {
        referralCode: string;
        newUserId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserByReferralCode(code: string): Promise<User | undefined>;
    withdrawReferralEarnings(id: string, body: {
        amount: number;
        bankDetails: any;
    }): Promise<{
        success: boolean;
        message: string;
        withdrawalId?: string;
    }>;
    getWithdrawalHistory(id: string): Promise<any[]>;
    getSavedPaymentMethods(id: string): Promise<any[]>;
    migrateReferralCodes(): Promise<{
        updated: number;
        errors: string[];
    }>;
    debugUsers(): Promise<any[]>;
}
