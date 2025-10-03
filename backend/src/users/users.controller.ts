import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import type { User } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userData: Omit<User, 'id' | 'totalOrders' | 'totalVolume' | 'status' | 'createdAt'>): Promise<User> {
    return this.usersService.createUser(userData);
  }

  @Post('create-or-update')
  async createOrUpdateUser(
    @Body() body: { uid: string; email: string; displayName?: string; phoneNumber?: string }
  ): Promise<User> {
    return this.usersService.createOrUpdateUser(
      body.uid,
      body.email,
      body.displayName,
      body.phoneNumber
    );
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User | undefined> {
    return this.usersService.findById(id);
  }

  @Get('uid/:uid')
  async getUserByUid(@Param('uid') uid: string): Promise<User | undefined> {
    return this.usersService.findByUid(uid);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updates: Partial<User>): Promise<User | undefined> {
    return this.usersService.updateUser(id, updates);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Put(':uid/stats')
  async updateUserStats(
    @Param('uid') uid: string,
    @Body() body: { totalOrders: number; totalVolume: number }
  ): Promise<User | undefined> {
    return this.usersService.updateUserStats(uid, body.totalOrders, body.totalVolume);
  }

  @Post('sync-from-firebase')
  async syncUsersFromFirebase(): Promise<{ message: string; usersCount: number }> {
    const users = await this.usersService.findAll();
    return {
      message: 'Users synced from Firebase Auth to Firestore',
      usersCount: users.length
    };
  }

  @Get('sync/:uid')
  async syncUserFromFirebase(@Param('uid') uid: string): Promise<User | undefined> {
    return this.usersService.syncUserFromFirebase(uid);
  }

  @Get('firebase-status')
  async getFirebaseStatus(): Promise<{ connected: boolean; error?: string; usersCount?: number }> {
    try {
      console.log('Testing Firebase connection...');
      const users = await this.usersService.findAll();
      console.log(`Found ${users.length} users`);
      return {
        connected: true,
        usersCount: users.length
      };
    } catch (error) {
      console.error('Firebase connection error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  @Get('test-mock')
  async getTestMock(): Promise<{ message: string; users: any[] }> {
    const users = await this.usersService.findAll();
    return {
      message: 'Mock users data',
      users: users
    };
  }

  @Get('test-simple')
  async getTestSimple(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Backend is working!',
      timestamp: new Date().toISOString()
    };
  }

  // Referral system endpoints
  @Get(':id/referral-stats')
  async getReferralStats(@Param('id') id: string) {
    return this.usersService.getReferralStats(id);
  }

  @Post('process-referral')
  async processReferral(
    @Body() body: { referralCode: string; newUserId: string }
  ) {
    return this.usersService.processReferral(body.referralCode, body.newUserId);
  }

  @Get('referral-code/:code')
  async getUserByReferralCode(@Param('code') code: string) {
    return this.usersService.findByReferralCode(code);
  }

  // Withdrawal endpoints
  @Post(':id/withdraw')
  async withdrawReferralEarnings(
    @Param('id') id: string,
    @Body() body: { amount: number; bankDetails: any }
  ) {
    return this.usersService.withdrawReferralEarnings(id, body.amount, body.bankDetails);
  }

  @Get(':id/withdrawals')
  async getWithdrawalHistory(@Param('id') id: string) {
    return this.usersService.getWithdrawalHistory(id);
  }

  @Get(':id/saved-methods')
  async getSavedPaymentMethods(@Param('id') id: string) {
    return this.usersService.getSavedPaymentMethods(id);
  }

  @Post('migrate-referral-codes')
  async migrateReferralCodes() {
    return this.usersService.migrateReferralCodes();
  }

  @Get('debug-users')
  async debugUsers() {
    return this.usersService.debugUsers();
  }

}
