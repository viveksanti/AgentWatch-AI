import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return { service: 'AgentWatch API', status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Lightweight keep-alive — called every 14 min by the frontend to prevent Render spin-down */
  @Get('ping')
  ping() {
    return { ok: true };
  }
}
