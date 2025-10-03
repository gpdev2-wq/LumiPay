import { Injectable } from '@nestjs/common';
import { db, auth } from '../firebase.config';
import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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
  // Referral system fields
  referralCode?: string;
  referredBy?: string; // User ID who referred this user
  referralEarnings: number; // Total earnings from referrals
  referralCount: number; // Number of successful referrals
}

@Injectable()
export class UsersService {
  constructor() {}

  async createUser(userData: Omit<User, 'id' | 'totalOrders' | 'totalVolume' | 'status' | 'createdAt' | 'referralEarnings' | 'referralCount'>): Promise<User> {
    if (!db) {
      throw new Error('Firebase not available');
    }
    
    const userRef = doc(collection(db, 'users'));
    const referralCode = await this.generateReferralCode();
    const user: User = {
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
    
    await setDoc(userRef, user);
    return user;
  }

  async findAll(): Promise<User[]> {
    if (!db) {
      console.error('Firestore db not initialized');
      throw new Error('Firebase not initialized');
    }
    console.log('Fetching users from Firestore collection: users');
    try {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      const users: User[] = snapshot.docs.map(d => {
        const data: any = d.data();
        const normalizeDate = (value: any): string => {
          if (!value) return new Date().toISOString();
          if (typeof value === 'string') return value;
          if (value?.toDate) {
            try { return value.toDate().toISOString(); } catch { return new Date().toISOString(); }
          }
          return new Date().toISOString();
        };
        const email: string = data.email || '';
        const displayName: string = data.displayName || (email ? email.split('@')[0] : 'User');
        const totalOrders: number = Number(data.totalOrders ?? 0) || 0;
        const totalVolume: number = Number(data.totalVolume ?? 0) || 0;
        const status: User['status'] = (data.status || 'active') as User['status'];
        const createdAt: string = normalizeDate(data.createdAt);
        const lastLoginAt: string | undefined = data.lastLoginAt ? normalizeDate(data.lastLoginAt) : undefined;
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
        } as User;
      });
      console.log(`Fetched ${users.length} users from Firestore`);
      return users;
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      return [];
    }
  }

  async findById(id: string): Promise<User | undefined> {
    if (!db) return undefined;
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;
    return { id: docSnap.id, ...docSnap.data() } as User;
  }

  async findByUid(uid: string): Promise<User | undefined> {
    if (!db) return undefined;
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    
    // If multiple users with same UID, prefer the one with referral data or most recent
    let bestUser = snapshot.docs[0];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Prefer users with referral data (referredBy or referralCode)
      if (data.referredBy || data.referralCode) {
        bestUser = doc;
        break;
      }
    }
    
    return { id: bestUser.id, ...bestUser.data() } as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    if (!db) return undefined;
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, updates);
    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) return undefined;
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
  }

  async deleteUser(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);
  }

  async updateUserStats(uid: string, totalOrders: number, totalVolume: number): Promise<User | undefined> {
    const user = await this.findByUid(uid);
    if (!user) return undefined;
    
    return this.updateUser(user.id, { totalOrders, totalVolume });
  }

  // This method should be called when a user creates an account
  async createOrUpdateUser(uid: string, email: string, displayName?: string, phoneNumber?: string): Promise<User> {
    let user = await this.findByUid(uid);
    
    if (user) {
      // Update existing user
      const updates: Partial<User> = {
        email,
        displayName,
        phoneNumber,
        lastLoginAt: new Date().toISOString(),
      };
      const updatedUser = await this.updateUser(user.id, updates);
      return updatedUser || user;
    } else {
      // Create new user with referral code
      const referralCode = await this.generateReferralCode();
      if (!db) throw new Error('Database not initialized');
      const userRef = doc(collection(db, 'users'));
      const newUser: User = {
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
      
      await setDoc(userRef, newUser);
      return newUser;
    }
  }

  // Get user from Firebase Auth and sync to Firestore
  async syncUserFromFirebase(uid: string): Promise<User | undefined> {
    return undefined;
  }

  // Generate unique referral code
  private async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let isUnique = false;
    
    while (!isUnique) {
      result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if this code already exists
      const existingUser = await this.findByReferralCode(result);
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    return result;
  }

  // Find user by referral code
  async findByReferralCode(referralCode: string): Promise<User | undefined> {
    if (!db) return undefined;
    const q = query(collection(db, 'users'), where('referralCode', '==', referralCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  // Get referral statistics for a user
  async getReferralStats(userId: string): Promise<{
    referralCount: number;
    referralEarnings: number;
    referrals: User[];
  }> {
    // Try to find user by ID first, then by UID
    let user = await this.findById(userId);
    if (!user) {
      user = await this.findByUid(userId);
    }
    
    if (!user) {
      throw new Error('User not found');
    }

    // Get all users referred by this user (using the user's ID)
    if (!db) throw new Error('Database not initialized');
    const q = query(collection(db, 'users'), where('referredBy', '==', user.id));
    const snapshot = await getDocs(q);
    const referrals: User[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));

    return {
      referralCount: referrals.length, // Calculate from actual referrals
      referralEarnings: user.referralEarnings || 0,
      referrals
    };
  }

  // Process referral when a new user signs up
  async processReferral(referralCode: string, newUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the referring user
      const referringUser = await this.findByReferralCode(referralCode);
      if (!referringUser) {
        return { success: false, message: 'Invalid referral code' };
      }

      // Find the new user by UID (Firebase Auth UID)
      const newUser = await this.findByUid(newUserId);
      if (!newUser) {
        return { success: false, message: 'New user not found' };
      }

      // Update the new user to include referral info
      await this.updateUser(newUser.id, {
        referredBy: referringUser.id
      });

      // Note: referralCount is now calculated dynamically from actual referrals

      return { success: true, message: 'Referral processed successfully' };
    } catch (error) {
      console.error('Error processing referral:', error);
      return { success: false, message: 'Error processing referral' };
    }
  }

  // Add referral commission (0.5% of order amount in INR)
  async addReferralCommission(userId: string, orderAmountUsdt: number, rateInrPerUsdt: number): Promise<void> {
    // Try to find user by UID first (since orders use UID), then by ID
    let user = await this.findByUid(userId);
    if (!user) {
      user = await this.findById(userId);
    }
    
    if (!user || !user.referredBy) {
      console.log(`No referral commission: user not found or no referrer. UserId: ${userId}, User: ${user ? 'found' : 'not found'}, ReferredBy: ${user?.referredBy || 'none'}`);
      return;
    }

    // Calculate commission in INR: 0.5% of USDT amount converted to INR
    const commissionInr = (orderAmountUsdt * 0.005) * rateInrPerUsdt;
    console.log(`DEBUG: Adding referral commission: ${orderAmountUsdt} USDT * 0.005 * ${rateInrPerUsdt} INR/USDT = ${commissionInr} INR to user ${user.referredBy}`);
    
    // Update referring user's earnings only (count is calculated from actual referrals)
    const referringUser = await this.findById(user.referredBy);
    if (referringUser) {
      const newEarnings = (referringUser.referralEarnings || 0) + commissionInr;
      console.log(`Adding referral commission: ${orderAmountUsdt} USDT * 0.005 * ${rateInrPerUsdt} INR/USDT = ${commissionInr} INR to user ${user.referredBy}`);
      console.log(`Updating referrer ${user.referredBy}: earnings ${referringUser.referralEarnings || 0} + ${commissionInr} = ${newEarnings}`);
      
      await this.updateUser(referringUser.id, {
        referralEarnings: newEarnings
      });
    } else {
      console.log(`Referrer not found: ${user.referredBy}`);
    }
  }

  // Withdraw referral earnings
  async withdrawReferralEarnings(userId: string, amount: number, bankDetails: any): Promise<{ success: boolean; message: string; withdrawalId?: string }> {
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

    // Generate withdrawal ID
    const withdrawalId = 'WD' + Date.now().toString(36).toUpperCase();

    // Update user's referral earnings
    const newEarnings = user.referralEarnings - amount;
    await this.updateUser(user.id, {
      referralEarnings: newEarnings
    });

    // Create withdrawal record
    const withdrawal = {
      id: withdrawalId,
      userId: user.id,
      amount,
      bankDetails,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      processedAt: null
    };

    // Store withdrawal in Firestore
    if (db) {
      await setDoc(doc(db, 'withdrawals', withdrawalId), withdrawal);
    }

    return { 
      success: true, 
      message: 'Withdrawal request submitted successfully', 
      withdrawalId 
    };
  }

  // Get withdrawal history
  async getWithdrawalHistory(userId: string): Promise<any[]> {
    if (!db) return [];

    const user = await this.findById(userId);
    if (!user) return [];

    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.id)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Get saved payment methods from user profile
  async getSavedPaymentMethods(userId: string): Promise<any[]> {
    const user = await this.findById(userId);
    if (!user) {
      return [];
    }

    const savedMethods = [];
    
    // Add bank details if available
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

    // Add UPI ID if available (check both bankDetails.upiId and upiDetails.upiId)
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

  async migrateReferralCodes(): Promise<{ updated: number; errors: string[] }> {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let updated = 0;
      const errors: string[] = [];

      console.log(`Found ${users.length} users to check`);

      for (const user of users) {
        try {
          console.log(`Checking user ${user.id}: referralCode = ${(user as any).referralCode}`);
          
          // Check if user already has a referral code
          if ((user as any).referralCode && (user as any).referralCode !== null) {
            console.log(`User ${user.id} already has referral code, skipping`);
            continue;
          }

          // Generate a new referral code
          const referralCode = await this.generateReferralCode();
          console.log(`Generated referral code ${referralCode} for user ${user.id}`);
          
          // Update the user with referral fields
          const userRef = doc(db, 'users', user.id);
          await updateDoc(userRef, {
            referralCode,
            referralEarnings: (user as any).referralEarnings || 0,
            referralCount: (user as any).referralCount || 0,
            referredBy: (user as any).referredBy || null
          });

          console.log(`Updated user ${user.id} with referral code ${referralCode}`);
          updated++;
        } catch (error) {
          console.error(`Failed to update user ${user.id}:`, error);
          errors.push(`Failed to update user ${user.id}: ${error.message}`);
        }
      }

      console.log(`Migration completed: ${updated} users updated, ${errors.length} errors`);
      return { updated, errors };
    } catch (error) {
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  async debugUsers(): Promise<any[]> {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      email: doc.data().email,
      referralCode: doc.data().referralCode,
      hasReferralCode: !!doc.data().referralCode
    }));
    
    return users;
  }
}