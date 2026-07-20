import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentsModule } from './agents/agents.module';
import { ExecutionsModule } from './executions/executions.module';
import { ObserverModule } from './observer/observer.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({
isGlobal:true
}),
    PrismaModule, AgentsModule, ExecutionsModule, ObserverModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
