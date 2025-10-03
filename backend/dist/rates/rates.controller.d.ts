import type { Rates } from './rates.service';
import { RatesService } from './rates.service';
export declare class RatesController {
    private readonly ratesService;
    constructor(ratesService: RatesService);
    get(): Promise<Rates>;
    set(body: Partial<Omit<Rates, 'updatedAt'>>): Promise<Rates>;
}
