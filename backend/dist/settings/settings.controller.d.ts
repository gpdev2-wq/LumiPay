import { SettingsService } from './settings.service';
import type { Settings } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<Settings>;
    updateSettings(body: Partial<Settings>): Promise<Settings>;
    getOrderLimits(): {
        minOrderAmount: number;
        maxOrderAmount: number;
    };
}
