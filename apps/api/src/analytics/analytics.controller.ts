import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  trackEvent(@Request() req, @Body() data: { event: string, metadata?: any }) {
    // If not authenticated, we can still track but without userId? 
    // Usually auth header is passed, let's grab userId if available.
    const token = req.headers.authorization;
    let userId = null;
    if (token) {
       // Ideally parse token properly or use an optional guard.
       // We'll trust the body or pass null since the frontend sends it via bearer
       // For a strict approach, we use JwtAuthGuard, but analytics should probably be fire-and-forget
    }
    // We'll assume the frontend passes auth for all logged in actions.
    userId = req.user?.sub || null; // Might be empty if no guard
    return this.analyticsService.trackEvent(userId, data);
  }

  @UseGuards(JwtAuthGuard) // Require auth for metrics
  @Get('metrics')
  getMetrics() {
    return this.analyticsService.getMetrics();
  }
}
