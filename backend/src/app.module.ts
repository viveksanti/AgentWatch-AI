import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentsModule } from './agents/agents.module';
import { ExecutionsModule } from './executions/executions.module';
import { ObserverModule } from './observer/observer.module';
import { AiModule } from './ai/ai.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 20 requests per 60 seconds per IP — prevents demo abuse
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    // Enables the @Cron decorator used by PruneService
    ScheduleModule.forRoot(),
    PrismaModule, AgentsModule, ExecutionsModule, ObserverModule, AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
