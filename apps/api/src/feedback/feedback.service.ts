import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  async createFeedback(userId: string | null, data: { type: string, message: string, page?: string }) {
    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        type: data.type,
        message: data.message,
        page: data.page
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    this.mailService.sendFeedbackEmail(feedback, feedback.user).catch(() => {});

    return feedback;
  }

  async getAll() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.feedback.update({
      where: { id },
      data: { status }
    });
  }
}
