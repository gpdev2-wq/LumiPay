"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatesService = void 0;
const common_1 = require("@nestjs/common");
const firebase_config_1 = require("../firebase.config");
const firestore_1 = require("firebase/firestore");
let RatesService = class RatesService {
    currentRates = {
        buyRateInrPerUsdt: 95,
        sellRateInrPerUsdt: 105,
        updatedAt: new Date().toISOString(),
    };
    collectionName = 'app_settings';
    documentId = 'rates';
    hasLoadedFromDb = false;
    async ensureLoaded() {
        if (this.hasLoadedFromDb)
            return;
        try {
            if (!firebase_config_1.db) {
                console.warn('Firebase not initialized, using default rates');
                return;
            }
            const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, this.documentId);
            const docSnap = await (0, firestore_1.getDoc)(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                this.currentRates = {
                    buyRateInrPerUsdt: data.buyRateInrPerUsdt || 95,
                    sellRateInrPerUsdt: data.sellRateInrPerUsdt || 105,
                    updatedAt: data.updatedAt || new Date().toISOString(),
                };
                console.log('Rates loaded from database:', this.currentRates);
            }
            else {
                console.log('No rates found in database, using defaults');
                await this.saveToDatabase();
            }
        }
        catch (error) {
            console.error('Error loading rates from database:', error);
        }
        this.hasLoadedFromDb = true;
    }
    async saveToDatabase() {
        try {
            if (!firebase_config_1.db)
                return;
            const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, this.documentId);
            await (0, firestore_1.setDoc)(docRef, this.currentRates);
            console.log('Rates saved to database:', this.currentRates);
        }
        catch (error) {
            console.error('Error saving rates to database:', error);
        }
    }
    async getRates() {
        await this.ensureLoaded();
        return this.currentRates;
    }
    async setRates(partial) {
        await this.ensureLoaded();
        this.currentRates = {
            ...this.currentRates,
            ...partial,
            updatedAt: new Date().toISOString(),
        };
        await this.saveToDatabase();
        return this.currentRates;
    }
};
exports.RatesService = RatesService;
exports.RatesService = RatesService = __decorate([
    (0, common_1.Injectable)()
], RatesService);
//# sourceMappingURL=rates.service.js.map