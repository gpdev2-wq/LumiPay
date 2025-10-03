import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import type { Settings } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<Settings> {
    return this.settingsService.getSettings();
  }

  @Post()
  async updateSettings(@Body() body: Partial<Settings>): Promise<Settings> {
    return this.settingsService.updateSettings(body);
  }

  @Get('limits')
  getOrderLimits() {
    return {
      minOrderAmount: this.settingsService.getMinOrderAmount(),
      maxOrderAmount: this.settingsService.getMaxOrderAmount(),
    };
  }
}
