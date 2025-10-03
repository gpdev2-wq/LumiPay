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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
let AdminController = class AdminController {
    exportOrders(res) {
        const header = 'id,type,amount_usdt,status,created_at\n';
        const sample = '1,sell,1000,ready_to_match,' + new Date().toISOString() + '\n';
        res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
        res.send(header + sample);
    }
    exportUsers(res) {
        const header = 'id,contact,created_at\n';
        const sample = '1,+91XXXXXX, ' + new Date().toISOString() + '\n';
        res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
        res.send(header + sample);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('export/orders.csv'),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "exportOrders", null);
__decorate([
    (0, common_1.Get)('export/users.csv'),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "exportUsers", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin')
], AdminController);
//# sourceMappingURL=admin.controller.js.map