import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'avante-api'
    };
  }

  @Get('metrics')
  getSystemMetrics() {
    // Basic system metrics (for Prometheus or custom dashboard)
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      pid: process.pid
    };
  }
}
