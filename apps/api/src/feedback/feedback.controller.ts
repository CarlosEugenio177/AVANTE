import { Controller, Post, Get, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Request() req, @Body() data: { type: string, message: string, page?: string }) {
    // Optionally grab user if auth is present
    const userId = req.user?.sub || null;
    return this.feedbackService.createFeedback(userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.feedbackService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.feedbackService.updateStatus(id, data.status);
  }
}
