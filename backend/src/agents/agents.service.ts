import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, UpdateAgentDto } from './agents.dto';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}
  list() { return this.prisma.agent.findMany({ orderBy: { createdAt: 'desc' }, include: { executions: { orderBy: { createdAt: 'desc' }, take: 1 } } }); }
  create(data: CreateAgentDto) { return this.prisma.agent.create({ data }); }
  async update(id: string, data: UpdateAgentDto) {
    await this.get(id);
    return this.prisma.agent.update({ where: { id }, data });
  }
  async remove(id: string) { await this.get(id); return this.prisma.agent.delete({ where: { id } }); }
  async get(id: string) { const agent = await this.prisma.agent.findUnique({ where: { id } }); if (!agent) throw new NotFoundException('Agent not found'); return agent; }
}
