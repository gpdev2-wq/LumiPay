import { Body, Controller, Get, Post } from '@nestjs/common';
import type { Rates } from './rates.service';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  async get(): Promise<Rates> {
    return await this.ratesService.getRates();
  }

  @Post()
  async set(@Body() body: Partial<Omit<Rates, 'updatedAt'>>): Promise<Rates> {
    return await this.ratesService.setRates(body);
  }
}


