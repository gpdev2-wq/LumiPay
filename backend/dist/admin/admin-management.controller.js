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
exports.AdminManagementController = void 0;
const common_1 = require("@nestjs/common");
const admin_auth_service_1 = require("./admin-auth.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let AdminManagementController = class AdminManagementController {
    adminAuthService;
    constructor(adminAuthService) {
        this.adminAuthService = adminAuthService;
    }
    async createAdmin(createAdminDto) {
        try {
            const { email, password, role } = createAdminDto;
            if (!email || !password || !role) {
                throw new common_1.BadRequestException('Email, password, and role are required');
            }
            if (!email.includes('@')) {
                throw new common_1.BadRequestException('Invalid email format');
            }
            if (password.length < 8) {
                throw new common_1.BadRequestException('Password must be at least 8 characters');
            }
            if (!['admin', 'super_admin'].includes(role)) {
                throw new common_1.BadRequestException('Role must be admin or super_admin');
            }
            const newAdmin = await this.adminAuthService.createAdmin(email, password, role);
            return {
                success: true,
                message: 'Admin created successfully',
                admin: {
                    email: newAdmin.email,
                    role: newAdmin.role,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Failed to create admin');
        }
    }
    async getAllAdmins() {
        try {
            const admins = await this.adminAuthService.getAllAdmins();
            return {
                success: true,
                admins: admins.map(admin => ({
                    email: admin.email,
                    role: admin.role,
                    isActive: admin.isActive,
                })),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch admins');
        }
    }
    async updateAdmin(email, updateAdminDto) {
        try {
            const updated = await this.adminAuthService.updateAdmin(email, updateAdminDto);
            if (!updated) {
                throw new common_1.BadRequestException('Admin not found');
            }
            return {
                success: true,
                message: 'Admin updated successfully',
                admin: {
                    email: updated.email,
                    role: updated.role,
                    isActive: updated.isActive,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Failed to update admin');
        }
    }
    async deactivateAdmin(email) {
        try {
            const deactivated = await this.adminAuthService.deactivateAdmin(email);
            if (!deactivated) {
                throw new common_1.BadRequestException('Admin not found');
            }
            return {
                success: true,
                message: 'Admin deactivated successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to deactivate admin');
        }
    }
    async getAdminInfo() {
        return {
            message: 'Admin management system',
            features: [
                'Create new admin accounts',
                'List all admins',
                'Update admin roles',
                'Deactivate admin accounts',
                'Role-based permissions',
            ],
            roles: {
                admin: 'Standard admin access',
                super_admin: 'Full system access including admin management',
            },
        };
    }
};
exports.AdminManagementController = AdminManagementController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminManagementController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminManagementController.prototype, "getAllAdmins", null);
__decorate([
    (0, common_1.Put)('update/:email'),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminManagementController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)('deactivate/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminManagementController.prototype, "deactivateAdmin", null);
__decorate([
    (0, common_1.Get)('info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminManagementController.prototype, "getAdminInfo", null);
exports.AdminManagementController = AdminManagementController = __decorate([
    (0, common_1.Controller)('admin/management'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_auth_service_1.AdminAuthService])
], AdminManagementController);
//# sourceMappingURL=admin-management.controller.js.map