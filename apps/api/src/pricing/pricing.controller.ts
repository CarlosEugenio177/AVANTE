import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  calculateAndSave(@Body() body: any, @Request() req) {
    return this.pricingService.calculateAndSave(req.user.sub, body);
  }

  @Get('history')
  history(@Request() req) {
    return this.pricingService.history(req.user.sub);
  }
}
