export type Rates = {
    buyRateInrPerUsdt: number;
    sellRateInrPerUsdt: number;
    updatedAt: string;
};
export declare class RatesService {
    private currentRates;
    private readonly collectionName;
    private readonly documentId;
    private hasLoadedFromDb;
    private ensureLoaded;
    private saveToDatabase;
    getRates(): Promise<Rates>;
    setRates(partial: Partial<Omit<Rates, 'updatedAt'>>): Promise<Rates>;
}
