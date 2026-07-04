import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(userId: string | null, data: { event: string, metadata?: any }) {
    return this.prisma.analyticsEvent.create({
      data: {
        userId,
        event: data.event,
        metadata: data.metadata || {},
      }
    });
  }

  async getMetrics() {
    // Admin metrics
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { userId: { not: null } }
    });

    const totalProducts = await this.prisma.product.count();
    const totalCalculations = await this.prisma.priceCalculation.count();
    const totalSimulations = await this.prisma.analyticsEvent.count({ where: { event: 'promotion_simulated' } });
    
    // Average calc time
    const calcEvents = await this.prisma.analyticsEvent.findMany({
      where: { event: 'calculation_created', metadata: { not: null } }
    });
    let totalTime = 0;
    let countTime = 0;
    calcEvents.forEach(e => {
      const meta = e.metadata as any;
      if (meta && meta.calculationTime) {
        totalTime += Number(meta.calculationTime);
        countTime++;
      }
    });
    const avgCalcTime = countTime > 0 ? (totalTime / countTime).toFixed(2) : 0;

    return {
      totalUsers,
      activeUsers: activeUsers.length,
      totalProducts,
      totalCalculations,
      totalSimulations,
      avgCalcTime,
    };
  }
}
