import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

export interface Settings {
  platformName: string;
  maintenanceMode: boolean;
  autoApproveOrders: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
  supportEmail: string;
  supportPhone: string;
  trc20Address: string;
  usdtContract: string;
}

@Injectable()
export class SettingsService {
  private settings: Settings = {
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

  private readonly collectionName = 'app_settings';
  private readonly documentId = 'default';
  private hasLoadedFromDb = false;

  private normalize(settings: any): Settings {
    const toNum = (v: any, d: number) => {
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
    } as Settings;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.hasLoadedFromDb) return;
    if (!db) {
      console.warn('SettingsService: Firestore DB not available, using in-memory defaults');
      this.hasLoadedFromDb = true;
      return;
    }
    try {
      const ref = doc(collection(db, this.collectionName), this.documentId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        this.settings = this.normalize(data);
        console.log('SettingsService: Loaded settings from Firestore');
      } else {
        // Seed defaults
        await setDoc(ref, this.settings);
        console.log('SettingsService: Seeded default settings to Firestore');
      }
    } catch (e) {
      console.error('SettingsService: Failed to load settings from Firestore', e);
    } finally {
      this.hasLoadedFromDb = true;
    }
  }

  async getSettings(): Promise<Settings> {
    await this.ensureLoaded();
    return this.settings;
  }

  async updateSettings(newSettings: Partial<Settings>): Promise<Settings> {
    await this.ensureLoaded();
    this.settings = this.normalize({ ...this.settings, ...newSettings });
    try {
      if (db) {
        const ref = doc(collection(db, this.collectionName), this.documentId);
        await setDoc(ref, this.settings, { merge: true });
      }
    } catch (e) {
      console.error('SettingsService: Failed to persist settings to Firestore', e);
    }
    return this.settings;
  }

  getMinOrderAmount(): number {
    return this.settings.minOrderAmount;
  }

  getMaxOrderAmount(): number {
    return this.settings.maxOrderAmount;
  }
}
