import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.product.findMany({ where: { userId } });
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
