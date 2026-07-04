import { Controller, Get, Post, Body, Query, UseGuards, Request, Header } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly auditService: AuditService
  ) {}

  @Post('calculate')
  async calculateAndSave(@Body() body: any, @Request() req) {
    const result = await this.pricingService.calculateAndSave(req.user.sub, body);
    this.auditService.log(req.user.sub, 'criação', 'PriceCalculation', result.id).catch(()=>{});
    return result;
  }

  @Get('history')
  history(@Request() req, @Query() query: any) {
    return this.pricingService.history(req.user.sub, query);
  }

  @Get('export-csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="historico_calculos.csv"')
  exportCsv(@Request() req, @Query() query: any) {
    return this.pricingService.exportCsv(req.user.sub, query);
  }
}
