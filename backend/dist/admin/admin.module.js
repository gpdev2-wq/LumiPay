"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const admin_controller_1 = require("./admin.controller");
const admin_auth_controller_1 = require("./admin-auth.controller");
const admin_management_controller_1 = require("./admin-management.controller");
const admin_auth_service_1 = require("./admin-auth.service");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [admin_controller_1.AdminController, admin_auth_controller_1.AdminAuthController, admin_management_controller_1.AdminManagementController],
        providers: [admin_auth_service_1.AdminAuthService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map