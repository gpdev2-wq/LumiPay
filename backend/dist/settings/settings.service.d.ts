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
export declare class SettingsService {
    private settings;
    private readonly collectionName;
    private readonly documentId;
    private hasLoadedFromDb;
    private normalize;
    private ensureLoaded;
    getSettings(): Promise<Settings>;
    updateSettings(newSettings: Partial<Settings>): Promise<Settings>;
    getMinOrderAmount(): number;
    getMaxOrderAmount(): number;
}
