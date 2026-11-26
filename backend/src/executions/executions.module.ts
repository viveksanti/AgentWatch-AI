import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AgentsModule } from '../agents/agents.module';
import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';
import { DocumentService } from './document.service';
import { PruneService } from './prune.service';

@Module({ imports: [AiModule, AgentsModule], controllers: [ExecutionsController], providers: [ExecutionsService, DocumentService, PruneService] })
export class ExecutionsModule {}
