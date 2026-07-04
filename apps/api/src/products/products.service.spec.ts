import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  product: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated list of products', async () => {
      const mockItems = [{ id: '1', name: 'Product 1' }];
      mockPrismaService.product.findMany.mockResolvedValue(mockItems);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll('user123', { page: 1, limit: 10 });

      expect(result.items).toEqual(mockItems);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply search and category filters', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll('user123', { search: 'soap', category: 'bath' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user123',
            name: { contains: 'soap', mode: 'insensitive' },
            category: { contains: 'bath', mode: 'insensitive' },
          }
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const mockItem = { id: 'prod1', name: 'Product 1' };
      mockPrismaService.product.findFirst.mockResolvedValue(mockItem);

      const result = await service.findOne('prod1', 'user123');
      expect(result).toEqual(mockItem);
      expect(mockPrismaService.product.findFirst).toHaveBeenCalledWith({
        where: { id: 'prod1', userId: 'user123' }
      });
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const mockData = { name: 'New Product' };
      const createdItem = { id: 'new', ...mockData, userId: 'user123' };
      mockPrismaService.product.create.mockResolvedValue(createdItem);

      const result = await service.create('user123', mockData);
      expect(result).toEqual(createdItem);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: { ...mockData, userId: 'user123' }
      });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const mockData = { name: 'Updated Product' };
      const updatedItem = { id: 'prod1', ...mockData };
      mockPrismaService.product.update.mockResolvedValue(updatedItem);

      const result = await service.update('prod1', 'user123', mockData);
      expect(result).toEqual(updatedItem);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod1' },
        data: mockData
      });
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const deletedItem = { id: 'prod1' };
      mockPrismaService.product.delete.mockResolvedValue(deletedItem);

      const result = await service.remove('prod1', 'user123');
      expect(result).toEqual(deletedItem);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod1' }
      });
    });
  });
});
