import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.settingsService.getProfile(req.user.sub);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() data: { name: string }) {
    return this.settingsService.updateProfile(req.user.sub, data.name);
  }

  @Put('onboarding')
  updateOnboarding(@Request() req, @Body() data: { progress: number }) {
    return this.settingsService.updateOnboarding(req.user.sub, data.progress);
  }
}
