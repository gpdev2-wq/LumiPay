"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_config_1 = require("../firebase.config");
const firestore_1 = require("firebase/firestore");
let UsersService = class UsersService {
    constructor() { }
    async createUser(userData) {
        if (!firebase_config_1.db) {
            throw new Error('Firebase not available');
        }
        const userRef = (0, firestore_1.doc)((0, firestore_1.collection)(firebase_config_1.db, 'users'));
        const referralCode = await this.generateReferralCode();
        const user = {
            id: userRef.id,
            totalOrders: 0,
            totalVolume: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            referralEarnings: 0,
            referralCount: 0,
            referralCode,
            ...userData,
        };
        await (0, firestore_1.setDoc)(userRef, user);
        return user;
    }
    async findAll() {
        if (!firebase_config_1.db) {
            console.error('Firestore db not initialized');
            throw new Error('Firebase not initialized');
        }
        console.log('Fetching users from Firestore collection: users');
        try {
            const usersCol = (0, firestore_1.collection)(firebase_config_1.db, 'users');
            const snapshot = await (0, firestore_1.getDocs)(usersCol);
            const users = snapshot.docs.map(d => {
                const data = d.data();
                const normalizeDate = (value) => {
                    if (!value)
                        return new Date().toISOString();
                    if (typeof value === 'string')
                        return value;
                    if (value?.toDate) {
                        try {
                            return value.toDate().toISOString();
                        }
                        catch {
                            return new Date().toISOString();
                        }
                    }
                    return new Date().toISOString();
                };
                const email = data.email || '';
                const displayName = data.displayName || (email ? email.split('@')[0] : 'User');
                const totalOrders = Number(data.totalOrders ?? 0) || 0;
                const totalVolume = Number(data.totalVolume ?? 0) || 0;
                const status = (data.status || 'active');
                const createdAt = normalizeDate(data.createdAt);
                const lastLoginAt = data.lastLoginAt ? normalizeDate(data.lastLoginAt) : undefined;
                return {
                    id: d.id,
                    uid: data.uid || d.id,
                    email,
                    displayName,
                    phoneNumber: data.phoneNumber,
                    emailVerified: Boolean(data.emailVerified),
                    createdAt,
                    lastLoginAt,
                    totalOrders,
                    totalVolume,
                    status,
                    bankDetails: data.bankDetails,
                    referralCode: data.referralCode,
                    referredBy: data.referredBy,
                    referralEarnings: data.referralEarnings || 0,
                    referralCount: data.referralCount || 0,
                };
            });
            console.log(`Fetched ${users.length} users from Firestore`);
            return users;
        }
        catch (error) {
            console.error('Error fetching users from Firestore:', error);
            return [];
        }
    }
    async findById(id) {
        if (!firebase_config_1.db)
            return undefined;
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, 'users', id);
        const docSnap = await (0, firestore_1.getDoc)(docRef);
        if (!docSnap.exists())
            return undefined;
        return { id: docSnap.id, ...docSnap.data() };
    }
    async findByUid(uid) {
        if (!firebase_config_1.db)
            return undefined;
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'users'), (0, firestore_1.where)('uid', '==', uid));
        const snapshot = await (0, firestore_1.getDocs)(q);
        if (snapshot.empty)
            return undefined;
        let bestUser = snapshot.docs[0];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.referredBy || data.referralCode) {
                bestUser = doc;
                break;
            }
        }
        return { id: bestUser.id, ...bestUser.data() };
    }
    async updateUser(id, updates) {
        if (!firebase_config_1.db)
            return undefined;
        const userRef = (0, firestore_1.doc)(firebase_config_1.db, 'users', id);
        await (0, firestore_1.updateDoc)(userRef, updates);
        const updatedDoc = await (0, firestore_1.getDoc)(userRef);
        if (!updatedDoc.exists())
            return undefined;
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }
    async deleteUser(id) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const userRef = (0, firestore_1.doc)(firebase_config_1.db, 'users', id);
        await (0, firestore_1.deleteDoc)(userRef);
    }
    async updateUserStats(uid, totalOrders, totalVolume) {
        const user = await this.findByUid(uid);
        if (!user)
            return undefined;
        return this.updateUser(user.id, { totalOrders, totalVolume });
    }
    async createOrUpdateUser(uid, email, displayName, phoneNumber) {
        let user = await this.findByUid(uid);
        if (user) {
            const updates = {
                email,
                displayName,
                phoneNumber,
                lastLoginAt: new Date().toISOString(),
            };
            const updatedUser = await this.updateUser(user.id, updates);
            return updatedUser || user;
        }
        else {
            const referralCode = await this.generateReferralCode();
            if (!firebase_config_1.db)
                throw new Error('Database not initialized');
            const userRef = (0, firestore_1.doc)((0, firestore_1.collection)(firebase_config_1.db, 'users'));
            const newUser = {
                id: userRef.id,
                uid,
                email,
                displayName,
                phoneNumber,
                emailVerified: true,
                totalOrders: 0,
                totalVolume: 0,
                status: 'active',
                createdAt: new Date().toISOString(),
                referralEarnings: 0,
                referralCount: 0,
                referralCode,
            };
            await (0, firestore_1.setDoc)(userRef, newUser);
            return newUser;
        }
    }
    async syncUserFromFirebase(uid) {
        return undefined;
    }
    async generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        let isUnique = false;
        while (!isUnique) {
            result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const existingUser = await this.findByReferralCode(result);
            if (!existingUser) {
                isUnique = true;
            }
        }
        return result;
    }
    async findByReferralCode(referralCode) {
        if (!firebase_config_1.db)
            return undefined;
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'users'), (0, firestore_1.where)('referralCode', '==', referralCode));
        const snapshot = await (0, firestore_1.getDocs)(q);
        if (snapshot.empty)
            return undefined;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    async getReferralStats(userId) {
        let user = await this.findById(userId);
        if (!user) {
            user = await this.findByUid(userId);
        }
        if (!user) {
            throw new Error('User not found');
        }
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'users'), (0, firestore_1.where)('referredBy', '==', user.id));
        const snapshot = await (0, firestore_1.getDocs)(q);
        const referrals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return {
            referralCount: referrals.length,
            referralEarnings: user.referralEarnings || 0,
            referrals
        };
    }
    async processReferral(referralCode, newUserId) {
        try {
            const referringUser = await this.findByReferralCode(referralCode);
            if (!referringUser) {
                return { success: false, message: 'Invalid referral code' };
            }
            const newUser = await this.findByUid(newUserId);
            if (!newUser) {
                return { success: false, message: 'New user not found' };
            }
            await this.updateUser(newUser.id, {
                referredBy: referringUser.id
            });
            return { success: true, message: 'Referral processed successfully' };
        }
        catch (error) {
            console.error('Error processing referral:', error);
            return { success: false, message: 'Error processing referral' };
        }
    }
    async addReferralCommission(userId, orderAmountUsdt, rateInrPerUsdt) {
        let user = await this.findByUid(userId);
        if (!user) {
            user = await this.findById(userId);
        }
        if (!user || !user.referredBy) {
            console.log(`No referral commission: user not found or no referrer. UserId: ${userId}, User: ${user ? 'found' : 'not found'}, ReferredBy: ${user?.referredBy || 'none'}`);
            return;
        }
        const commissionInr = (orderAmountUsdt * 0.005) * rateInrPerUsdt;
        console.log(`DEBUG: Adding referral commission: ${orderAmountUsdt} USDT * 0.005 * ${rateInrPerUsdt} INR/USDT = ${commissionInr} INR to user ${user.referredBy}`);
        const referringUser = await this.findById(user.referredBy);
        if (referringUser) {
            const newEarnings = (referringUser.referralEarnings || 0) + commissionInr;
            console.log(`Adding referral commission: ${orderAmountUsdt} USDT * 0.005 * ${rateInrPerUsdt} INR/USDT = ${commissionInr} INR to user ${user.referredBy}`);
            console.log(`Updating referrer ${user.referredBy}: earnings ${referringUser.referralEarnings || 0} + ${commissionInr} = ${newEarnings}`);
            await this.updateUser(referringUser.id, {
                referralEarnings: newEarnings
            });
        }
        else {
            console.log(`Referrer not found: ${user.referredBy}`);
        }
    }
    async withdrawReferralEarnings(userId, amount, bankDetails) {
        const user = await this.findById(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        if (!user.referralEarnings || user.referralEarnings < amount) {
            return { success: false, message: 'Insufficient referral earnings' };
        }
        if (amount < 10000) {
            return { success: false, message: 'Minimum withdrawal amount is ₹10,000' };
        }
        const withdrawalId = 'WD' + Date.now().toString(36).toUpperCase();
        const newEarnings = user.referralEarnings - amount;
        await this.updateUser(user.id, {
            referralEarnings: newEarnings
        });
        const withdrawal = {
            id: withdrawalId,
            userId: user.id,
            amount,
            bankDetails,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            processedAt: null
        };
        if (firebase_config_1.db) {
            await (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_config_1.db, 'withdrawals', withdrawalId), withdrawal);
        }
        return {
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawalId
        };
    }
    async getWithdrawalHistory(userId) {
        if (!firebase_config_1.db)
            return [];
        const user = await this.findById(userId);
        if (!user)
            return [];
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'withdrawals'), (0, firestore_1.where)('userId', '==', user.id));
        const snapshot = await (0, firestore_1.getDocs)(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    async getSavedPaymentMethods(userId) {
        const user = await this.findById(userId);
        if (!user) {
            return [];
        }
        const savedMethods = [];
        if (user.bankDetails?.accountNumber && user.bankDetails?.ifscCode && user.bankDetails?.accountHolderName) {
            savedMethods.push({
                id: 'bank-primary',
                type: 'bank',
                name: `${user.bankDetails.accountHolderName} - ****${user.bankDetails.accountNumber.slice(-4)}`,
                details: {
                    accountHolderName: user.bankDetails.accountHolderName,
                    accountNumber: user.bankDetails.accountNumber,
                    ifscCode: user.bankDetails.ifscCode
                }
            });
        }
        const upiId = user.bankDetails?.upiId || user.upiDetails?.upiId;
        if (upiId) {
            savedMethods.push({
                id: 'upi-primary',
                type: 'upi',
                name: `UPI - ${upiId}`,
                details: {
                    upiId: upiId
                }
            });
        }
        return savedMethods;
    }
    async migrateReferralCodes() {
        if (!firebase_config_1.db) {
            throw new Error('Database not initialized');
        }
        try {
            const usersSnapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_config_1.db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            let updated = 0;
            const errors = [];
            console.log(`Found ${users.length} users to check`);
            for (const user of users) {
                try {
                    console.log(`Checking user ${user.id}: referralCode = ${user.referralCode}`);
                    if (user.referralCode && user.referralCode !== null) {
                        console.log(`User ${user.id} already has referral code, skipping`);
                        continue;
                    }
                    const referralCode = await this.generateReferralCode();
                    console.log(`Generated referral code ${referralCode} for user ${user.id}`);
                    const userRef = (0, firestore_1.doc)(firebase_config_1.db, 'users', user.id);
                    await (0, firestore_1.updateDoc)(userRef, {
                        referralCode,
                        referralEarnings: user.referralEarnings || 0,
                        referralCount: user.referralCount || 0,
                        referredBy: user.referredBy || null
                    });
                    console.log(`Updated user ${user.id} with referral code ${referralCode}`);
                    updated++;
                }
                catch (error) {
                    console.error(`Failed to update user ${user.id}:`, error);
                    errors.push(`Failed to update user ${user.id}: ${error.message}`);
                }
            }
            console.log(`Migration completed: ${updated} users updated, ${errors.length} errors`);
            return { updated, errors };
        }
        catch (error) {
            throw new Error(`Migration failed: ${error.message}`);
        }
    }
    async debugUsers() {
        if (!firebase_config_1.db) {
            throw new Error('Database not initialized');
        }
        const usersSnapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_config_1.db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email,
            referralCode: doc.data().referralCode,
            hasReferralCode: !!doc.data().referralCode
        }));
        return users;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UsersService);
//# sourceMappingURL=users.service.js.map