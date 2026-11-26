import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PruneService {
  private readonly logger = new Logger(PruneService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneOldExecutions() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.execution.deleteMany({ where: { createdAt: { lt: cutoff } } });
    if (count > 0) this.logger.log(`Pruned ${count} executions older than 7 days`);
  }
}
