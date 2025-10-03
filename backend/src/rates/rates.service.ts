import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Rates = {
  buyRateInrPerUsdt: number;
  sellRateInrPerUsdt: number;
  updatedAt: string;
};

@Injectable()
export class RatesService {
  private currentRates: Rates = {
    buyRateInrPerUsdt: 95,
    sellRateInrPerUsdt: 105,
    updatedAt: new Date().toISOString(),
  };
  private readonly collectionName = 'app_settings';
  private readonly documentId = 'rates';
  private hasLoadedFromDb = false;

  private async ensureLoaded(): Promise<void> {
    if (this.hasLoadedFromDb) return;
    
    try {
      if (!db) {
        console.warn('Firebase not initialized, using default rates');
        return;
      }
      
      const docRef = doc(db, this.collectionName, this.documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.currentRates = {
          buyRateInrPerUsdt: data.buyRateInrPerUsdt || 95,
          sellRateInrPerUsdt: data.sellRateInrPerUsdt || 105,
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
        console.log('Rates loaded from database:', this.currentRates);
      } else {
        console.log('No rates found in database, using defaults');
        // Save default rates to database
        await this.saveToDatabase();
      }
    } catch (error) {
      console.error('Error loading rates from database:', error);
    }
    
    this.hasLoadedFromDb = true;
  }

  private async saveToDatabase(): Promise<void> {
    try {
      if (!db) return;
      
      const docRef = doc(db, this.collectionName, this.documentId);
      await setDoc(docRef, this.currentRates);
      console.log('Rates saved to database:', this.currentRates);
    } catch (error) {
      console.error('Error saving rates to database:', error);
    }
  }

  async getRates(): Promise<Rates> {
    await this.ensureLoaded();
    return this.currentRates;
  }

  async setRates(partial: Partial<Omit<Rates, 'updatedAt'>>): Promise<Rates> {
    await this.ensureLoaded();
    
    this.currentRates = {
      ...this.currentRates,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    
    await this.saveToDatabase();
    return this.currentRates;
  }
}


