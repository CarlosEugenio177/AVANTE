import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePrice } from '@avante/shared';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculateAndSave(userId: string, data: any) {
    const retail = calculatePrice(data.cost, data.fixedCostsPercent, data.taxPercent, data.cardFeePercent, data.retailMargin);
    const wholesale = calculatePrice(data.cost, data.fixedCostsPercent, data.taxPercent, data.cardFeePercent, data.wholesaleMargin);
    const promotion = calculatePrice(data.cost, data.fixedCostsPercent, data.taxPercent, data.cardFeePercent, data.promotionMargin);

    return this.prisma.priceCalculation.create({
      data: {
        userId,
        productId: data.productId,
        cost: data.cost,
        fixedCostsPercent: data.fixedCostsPercent,
        taxPercent: data.taxPercent,
        cardFeePercent: data.cardFeePercent,
        retailMargin: data.retailMargin,
        wholesaleMargin: data.wholesaleMargin,
        promotionMargin: data.promotionMargin,
        retailPrice: retail.salePrice,
        wholesalePrice: wholesale.salePrice,
        promotionPrice: promotion.salePrice,
        maxDiscount: retail.maxDiscount,
        netProfit: retail.netProfit,
        markup: retail.markup,
      },
      include: {
        product: true
      }
    });
  }

  async history(userId: string, query: any = {}) {
    const { productId, startDate, endDate } = query;
    const where: any = { userId };

    if (productId) {
      where.productId = productId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return this.prisma.priceCalculation.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
