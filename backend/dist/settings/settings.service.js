"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_config_1 = require("../firebase.config");
const firestore_1 = require("firebase/firestore");
let SettingsService = class SettingsService {
    settings = {
        platformName: 'USDT-INR Exchange',
        maintenanceMode: false,
        autoApproveOrders: false,
        minOrderAmount: 100,
        maxOrderAmount: 1000000,
        supportEmail: 'support@usdtinr.com',
        supportPhone: '+91 9876543210',
        trc20Address: 'TVz5oQurcJUoPohtdCGH89PhqKvFgiYzRq',
        usdtContract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    };
    collectionName = 'app_settings';
    documentId = 'default';
    hasLoadedFromDb = false;
    normalize(settings) {
        const toNum = (v, d) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : d;
        };
        return {
            platformName: settings.platformName ?? this.settings.platformName,
            maintenanceMode: Boolean(settings.maintenanceMode ?? this.settings.maintenanceMode),
            autoApproveOrders: Boolean(settings.autoApproveOrders ?? this.settings.autoApproveOrders),
            minOrderAmount: toNum(settings.minOrderAmount, this.settings.minOrderAmount),
            maxOrderAmount: toNum(settings.maxOrderAmount, this.settings.maxOrderAmount),
            supportEmail: settings.supportEmail ?? this.settings.supportEmail,
            supportPhone: settings.supportPhone ?? this.settings.supportPhone,
            trc20Address: settings.trc20Address ?? this.settings.trc20Address,
            usdtContract: settings.usdtContract ?? this.settings.usdtContract,
        };
    }
    async ensureLoaded() {
        if (this.hasLoadedFromDb)
            return;
        if (!firebase_config_1.db) {
            console.warn('SettingsService: Firestore DB not available, using in-memory defaults');
            this.hasLoadedFromDb = true;
            return;
        }
        try {
            const ref = (0, firestore_1.doc)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), this.documentId);
            const snap = await (0, firestore_1.getDoc)(ref);
            if (snap.exists()) {
                const data = snap.data();
                this.settings = this.normalize(data);
                console.log('SettingsService: Loaded settings from Firestore');
            }
            else {
                await (0, firestore_1.setDoc)(ref, this.settings);
                console.log('SettingsService: Seeded default settings to Firestore');
            }
        }
        catch (e) {
            console.error('SettingsService: Failed to load settings from Firestore', e);
        }
        finally {
            this.hasLoadedFromDb = true;
        }
    }
    async getSettings() {
        await this.ensureLoaded();
        return this.settings;
    }
    async updateSettings(newSettings) {
        await this.ensureLoaded();
        this.settings = this.normalize({ ...this.settings, ...newSettings });
        try {
            if (firebase_config_1.db) {
                const ref = (0, firestore_1.doc)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), this.documentId);
                await (0, firestore_1.setDoc)(ref, this.settings, { merge: true });
            }
        }
        catch (e) {
            console.error('SettingsService: Failed to persist settings to Firestore', e);
        }
        return this.settings;
    }
    getMinOrderAmount() {
        return this.settings.minOrderAmount;
    }
    getMaxOrderAmount() {
        return this.settings.maxOrderAmount;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)()
], SettingsService);
//# sourceMappingURL=settings.service.js.map