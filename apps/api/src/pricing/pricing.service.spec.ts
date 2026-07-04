import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  priceCalculation: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
};

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateAndSave', () => {
    it('should calculate prices and save to db', async () => {
      const payload = {
        productId: 'prod1',
        cost: 10,
        fixedCostsPercent: 10,
        taxPercent: 10,
        cardFeePercent: 10,
        retailMargin: 20,
        wholesaleMargin: 10,
        promotionMargin: 5
      };

      const mockSavedCalc = { id: 'calc1', ...payload };
      mockPrismaService.priceCalculation.create.mockResolvedValue(mockSavedCalc);

      const result = await service.calculateAndSave('user1', payload);

      expect(result).toEqual(mockSavedCalc);
      
      // Calculate maxDiscount etc...
      // cost: 10, total percent retail: 50%. salePrice: 10 / 0.5 = 20
      expect(mockPrismaService.priceCalculation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user1',
          productId: 'prod1',
          retailPrice: 20, // 10 / (1 - 0.5)
          netProfit: 4,    // 20 * 0.2
        }),
        include: { product: true }
      });
    });
  });

  describe('history', () => {
    it('should return calculations history without filters', async () => {
      const mockHistory = [{ id: '1', retailPrice: 20 }];
      mockPrismaService.priceCalculation.findMany.mockResolvedValue(mockHistory);

      const result = await service.history('user1');
      expect(result).toEqual(mockHistory);
      expect(mockPrismaService.priceCalculation.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should apply productId and date filters', async () => {
      mockPrismaService.priceCalculation.findMany.mockResolvedValue([]);

      const startDate = '2023-01-01T00:00:00.000Z';
      const endDate = '2023-12-31T23:59:59.000Z';

      await service.history('user1', { productId: 'prod2', startDate, endDate });

      expect(mockPrismaService.priceCalculation.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          productId: 'prod2',
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      });
    });
  });
});
