"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
let AdminAuthService = class AdminAuthService {
    jwtService;
    usersService;
    admins = [
        {
            email: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'super_admin',
            isActive: true,
        },
    ];
    constructor(jwtService, usersService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async validateAdmin(email, password) {
        try {
            const admin = this.admins.find(a => a.email === email && a.isActive);
            if (!admin) {
                return {
                    success: false,
                    message: 'Invalid admin credentials',
                };
            }
            const isPasswordValid = await bcrypt.compare(password, admin.password) || password === admin.password;
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid admin credentials',
                };
            }
            const payload = {
                email: admin.email,
                role: admin.role,
                sub: admin.email,
                type: 'admin',
            };
            const token = this.jwtService.sign(payload, {
                expiresIn: '8h',
            });
            console.log(`🔐 Admin login: ${admin.email} at ${new Date().toISOString()}`);
            return {
                success: true,
                token,
                admin: {
                    email: admin.email,
                    role: admin.role,
                },
            };
        }
        catch (error) {
            console.error('Admin validation error:', error);
            return {
                success: false,
                message: 'Authentication failed',
            };
        }
    }
    async isAdmin(email) {
        const admin = this.admins.find(a => a.email === email && a.isActive);
        return !!admin;
    }
    async getAdminByEmail(email) {
        return this.admins.find(a => a.email === email && a.isActive) || null;
    }
    async createAdmin(email, password, role = 'admin') {
        const existingAdmin = this.admins.find(a => a.email === email);
        if (existingAdmin) {
            throw new Error('Admin with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = {
            email,
            password: hashedPassword,
            role,
            isActive: true,
        };
        this.admins.push(newAdmin);
        console.log(`👤 New admin created: ${email} with role: ${role}`);
        return {
            email: newAdmin.email,
            role: newAdmin.role,
            isActive: newAdmin.isActive,
        };
    }
    async updateAdmin(email, updates) {
        const admin = this.admins.find(a => a.email === email);
        if (!admin) {
            return null;
        }
        if (updates.email && updates.email !== email) {
            const existingAdmin = this.admins.find(a => a.email === updates.email);
            if (existingAdmin) {
                throw new Error('Admin with this email already exists');
            }
            admin.email = updates.email;
        }
        if (updates.role) {
            admin.role = updates.role;
        }
        if (updates.isActive !== undefined) {
            admin.isActive = updates.isActive;
        }
        console.log(`👤 Admin updated: ${email}`);
        return {
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
        };
    }
    async deactivateAdmin(email) {
        const admin = this.admins.find(a => a.email === email);
        if (admin) {
            admin.isActive = false;
            console.log(`🚫 Admin deactivated: ${email}`);
            return true;
        }
        return false;
    }
    async getAllAdmins() {
        return this.admins.map(admin => ({
            email: admin.email,
            role: admin.role,
        }));
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, users_service_1.UsersService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map