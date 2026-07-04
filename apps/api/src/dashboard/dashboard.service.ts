import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    const totalProducts = await this.prisma.product.count({ where: { userId } });
    
    const totalCalculations = await this.prisma.priceCalculation.count({ where: { userId } });
    
    // Avg margin
    const products = await this.prisma.product.findMany({ 
      where: { userId },
      select: { margin: true, salePrice: true }
    });
    const avgMargin = products.length 
      ? products.reduce((acc, p) => acc + p.margin, 0) / products.length 
      : 0;

    // Potential Revenue (assuming each product has 1 unit for now, as we don't have stock)
    const potentialRevenue = products.reduce((acc, p) => acc + p.salePrice, 0);

    // Most profitable product (from calculations)
    const mostProfitableCalc = await this.prisma.priceCalculation.findFirst({
      where: { userId },
      orderBy: { netProfit: 'desc' },
      include: { product: true }
    });

    const lastCalc = await this.prisma.priceCalculation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: true }
    });

    return {
      totalProducts,
      totalCalculations,
      avgMargin,
      potentialRevenue,
      mostProfitableProduct: mostProfitableCalc?.product?.name || null,
      maxProfit: mostProfitableCalc?.netProfit || 0,
      lastCalculation: lastCalc 
        ? {
            productName: lastCalc.product?.name,
            retailMargin: lastCalc.retailMargin
          }
        : null
    };
  }
}
