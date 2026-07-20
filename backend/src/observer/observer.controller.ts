import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('observer')
export class ObserverController {
  constructor(private prisma: PrismaService) {}
  @Get('overview')
  async overview() {
    const [agents, activeAgents, executions, grouped, recent, latestExecutions] = await Promise.all([
      this.prisma.agent.count(),
      this.prisma.agent.count({ where: { status: 'ACTIVE' } }),
      this.prisma.execution.count(),
      this.prisma.execution.groupBy({ by: ['status'], _count: true }),
      this.prisma.execution.findMany({ take: 100, orderBy: { createdAt: 'desc' }, select: { latency: true, tokens: true, cost: true, status: true, createdAt: true } }),
      this.prisma.execution.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { agent: { select: { name: true, type: true } } } }),
    ]);
    const successes = grouped.find((x) => x.status === 'SUCCESS')?._count ?? 0;
    return {
      agents, activeAgents, executions, successRate: executions ? Math.round((successes / executions) * 1000) / 10 : 100,
      runtimeMode: process.env.OPENAI_API_KEY && process.env.AI_SIMULATION !== 'true' ? 'LIVE' : 'SIMULATION',
      avgLatency: recent.length ? Math.round(recent.reduce((s, x) => s + x.latency, 0) / recent.length) : 0,
      totalTokens: recent.reduce((s, x) => s + x.tokens, 0), totalCost: recent.reduce((s, x) => s + x.cost, 0),
      timeline: [...recent].reverse().map((x) => ({ time: x.createdAt, latency: x.latency, tokens: x.tokens, success: x.status === 'SUCCESS' ? 1 : 0 })),
      statuses: Object.fromEntries(grouped.map((item) => [item.status, item._count])),
      latestExecutions,
    };
  }
}
