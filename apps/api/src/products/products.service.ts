import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: any = {}) {
    const { search, category, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async findOne(id: string, userId: string) {
    return this.prisma.product.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        userId,
      }
    });
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
