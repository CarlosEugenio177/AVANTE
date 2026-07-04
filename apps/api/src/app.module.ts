import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, PricingModule],
})
export class AppModule {}
