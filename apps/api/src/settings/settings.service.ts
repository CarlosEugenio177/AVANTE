import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      onboardingProgress: user.onboardingProgress
    };
  }

  async updateProfile(userId: string, name: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, name: true, email: true }
    });
  }

  async updateOnboarding(userId: string, progress: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingProgress: progress },
      select: { id: true, onboardingProgress: true }
    });
  }
}
