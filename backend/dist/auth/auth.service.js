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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const firebase_admin_1 = require("firebase-admin");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(uid) {
        try {
            const decodedToken = await firebase_admin_1.admin.auth().verifyIdToken(uid);
            const user = await this.usersService.findByUid(decodedToken.uid);
            if (user) {
                return user;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async generateJwtToken(user) {
        const payload = {
            uid: user.uid,
            email: user.email,
            sub: user.uid
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async verifyFirebaseToken(token) {
        try {
            const decodedToken = await firebase_admin_1.admin.auth().verifyIdToken(token);
            return decodedToken;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid Firebase token');
        }
    }
    async isAdmin(uid) {
        try {
            const user = await this.usersService.findByUid(uid);
            return user?.role === 'admin' || user?.role === 'super_admin';
        }
        catch (error) {
            return false;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map