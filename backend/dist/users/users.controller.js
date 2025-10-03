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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createUser(userData) {
        return this.usersService.createUser(userData);
    }
    async createOrUpdateUser(body) {
        return this.usersService.createOrUpdateUser(body.uid, body.email, body.displayName, body.phoneNumber);
    }
    async getAllUsers() {
        return this.usersService.findAll();
    }
    async getUserById(id) {
        return this.usersService.findById(id);
    }
    async getUserByUid(uid) {
        return this.usersService.findByUid(uid);
    }
    async updateUser(id, updates) {
        return this.usersService.updateUser(id, updates);
    }
    async deleteUser(id) {
        await this.usersService.deleteUser(id);
        return { message: 'User deleted successfully' };
    }
    async updateUserStats(uid, body) {
        return this.usersService.updateUserStats(uid, body.totalOrders, body.totalVolume);
    }
    async syncUsersFromFirebase() {
        const users = await this.usersService.findAll();
        return {
            message: 'Users synced from Firebase Auth to Firestore',
            usersCount: users.length
        };
    }
    async syncUserFromFirebase(uid) {
        return this.usersService.syncUserFromFirebase(uid);
    }
    async getFirebaseStatus() {
        try {
            console.log('Testing Firebase connection...');
            const users = await this.usersService.findAll();
            console.log(`Found ${users.length} users`);
            return {
                connected: true,
                usersCount: users.length
            };
        }
        catch (error) {
            console.error('Firebase connection error:', error);
            return {
                connected: false,
                error: error.message
            };
        }
    }
    async getTestMock() {
        const users = await this.usersService.findAll();
        return {
            message: 'Mock users data',
            users: users
        };
    }
    async getTestSimple() {
        return {
            message: 'Backend is working!',
            timestamp: new Date().toISOString()
        };
    }
    async getReferralStats(id) {
        return this.usersService.getReferralStats(id);
    }
    async processReferral(body) {
        return this.usersService.processReferral(body.referralCode, body.newUserId);
    }
    async getUserByReferralCode(code) {
        return this.usersService.findByReferralCode(code);
    }
    async withdrawReferralEarnings(id, body) {
        return this.usersService.withdrawReferralEarnings(id, body.amount, body.bankDetails);
    }
    async getWithdrawalHistory(id) {
        return this.usersService.getWithdrawalHistory(id);
    }
    async getSavedPaymentMethods(id) {
        return this.usersService.getSavedPaymentMethods(id);
    }
    async migrateReferralCodes() {
        return this.usersService.migrateReferralCodes();
    }
    async debugUsers() {
        return this.usersService.debugUsers();
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Post)('create-or-update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createOrUpdateUser", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)('uid/:uid'),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByUid", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Put)(':uid/stats'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserStats", null);
__decorate([
    (0, common_1.Post)('sync-from-firebase'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "syncUsersFromFirebase", null);
__decorate([
    (0, common_1.Get)('sync/:uid'),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "syncUserFromFirebase", null);
__decorate([
    (0, common_1.Get)('firebase-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFirebaseStatus", null);
__decorate([
    (0, common_1.Get)('test-mock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTestMock", null);
__decorate([
    (0, common_1.Get)('test-simple'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTestSimple", null);
__decorate([
    (0, common_1.Get)(':id/referral-stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getReferralStats", null);
__decorate([
    (0, common_1.Post)('process-referral'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "processReferral", null);
__decorate([
    (0, common_1.Get)('referral-code/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByReferralCode", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "withdrawReferralEarnings", null);
__decorate([
    (0, common_1.Get)(':id/withdrawals'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getWithdrawalHistory", null);
__decorate([
    (0, common_1.Get)(':id/saved-methods'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSavedPaymentMethods", null);
__decorate([
    (0, common_1.Post)('migrate-referral-codes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "migrateReferralCodes", null);
__decorate([
    (0, common_1.Get)('debug-users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "debugUsers", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map