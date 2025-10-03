export interface User {
    id: string;
    uid: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
    totalOrders: number;
    totalVolume: number;
    status: 'active' | 'suspended' | 'banned';
    bankDetails?: {
        accountNumber?: string;
        ifscCode?: string;
        accountHolderName?: string;
        upiId?: string;
    };
    upiDetails?: {
        upiId?: string;
        upiName?: string;
    };
    referralCode?: string;
    referredBy?: string;
    referralEarnings: number;
    referralCount: number;
}
export declare class UsersService {
    constructor();
    createUser(userData: Omit<User, 'id' | 'totalOrders' | 'totalVolume' | 'status' | 'createdAt' | 'referralEarnings' | 'referralCount'>): Promise<User>;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | undefined>;
    findByUid(uid: string): Promise<User | undefined>;
    updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
    deleteUser(id: string): Promise<void>;
    updateUserStats(uid: string, totalOrders: number, totalVolume: number): Promise<User | undefined>;
    createOrUpdateUser(uid: string, email: string, displayName?: string, phoneNumber?: string): Promise<User>;
    syncUserFromFirebase(uid: string): Promise<User | undefined>;
    private generateReferralCode;
    findByReferralCode(referralCode: string): Promise<User | undefined>;
    getReferralStats(userId: string): Promise<{
        referralCount: number;
        referralEarnings: number;
        referrals: User[];
    }>;
    processReferral(referralCode: string, newUserId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addReferralCommission(userId: string, orderAmountUsdt: number, rateInrPerUsdt: number): Promise<void>;
    withdrawReferralEarnings(userId: string, amount: number, bankDetails: any): Promise<{
        success: boolean;
        message: string;
        withdrawalId?: string;
    }>;
    getWithdrawalHistory(userId: string): Promise<any[]>;
    getSavedPaymentMethods(userId: string): Promise<any[]>;
    migrateReferralCodes(): Promise<{
        updated: number;
        errors: string[];
    }>;
    debugUsers(): Promise<any[]>;
}
