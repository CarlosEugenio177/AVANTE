import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PricingModule } from './pricing/pricing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuditModule } from './audit/audit.module';
import { SettingsModule } from './settings/settings.module';
import { HealthController } from './core/health.controller';
import { GlobalExceptionFilter } from './core/global-exception.filter';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, PricingModule, DashboardModule, AnalyticsModule, FeedbackModule, AuditModule, SettingsModule],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    }
  ],
})
export class AppModule {}
