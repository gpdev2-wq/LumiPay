"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const rates_module_1 = require("./rates/rates.module");
const admin_module_1 = require("./admin/admin.module");
const orders_module_1 = require("./orders/orders.module");
const users_module_1 = require("./users/users.module");
const settings_module_1 = require("./settings/settings.module");
const contacts_module_1 = require("./contacts/contacts.module");
const tickets_module_1 = require("./tickets/tickets.module");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, rates_module_1.RatesModule, admin_module_1.AdminModule, orders_module_1.OrdersModule, users_module_1.UsersModule, settings_module_1.SettingsModule, contacts_module_1.ContactsModule, tickets_module_1.TicketsModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map