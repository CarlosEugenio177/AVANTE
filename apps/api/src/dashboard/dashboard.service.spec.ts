import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  product: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  priceCalculation: {
    count: vi.fn(),
    findFirst: vi.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return correct stats when data is available', async () => {
      mockPrismaService.product.count.mockResolvedValue(2);
      mockPrismaService.priceCalculation.count.mockResolvedValue(3);
      
      const mockProducts = [
        { margin: 20, salePrice: 100 },
        { margin: 40, salePrice: 200 }
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const mockMostProfitable = {
        netProfit: 50,
        product: { name: 'Product A' }
      };
      // findFirst is called twice: once for most profitable, once for last calc
      mockPrismaService.priceCalculation.findFirst
        .mockResolvedValueOnce(mockMostProfitable)
        .mockResolvedValueOnce({
          retailMargin: 35,
          product: { name: 'Product B' }
        });

      const result = await service.getStats('user1');

      expect(result).toEqual({
        totalProducts: 2,
        totalCalculations: 3,
        avgMargin: 30, // (20 + 40) / 2
        potentialRevenue: 300, // 100 + 200
        mostProfitableProduct: 'Product A',
        maxProfit: 50,
        lastCalculation: {
          productName: 'Product B',
          retailMargin: 35,
        }
      });
    });

    it('should return default stats when no data is available', async () => {
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.priceCalculation.count.mockResolvedValue(0);
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.priceCalculation.findFirst.mockResolvedValue(null);

      const result = await service.getStats('user1');

      expect(result).toEqual({
        totalProducts: 0,
        totalCalculations: 0,
        avgMargin: 0,
        potentialRevenue: 0,
        mostProfitableProduct: null,
        maxProfit: 0,
        lastCalculation: null
      });
    });
  });
});
