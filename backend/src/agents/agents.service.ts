import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, UpdateAgentDto } from './agents.dto';

const MAX_USER_AGENTS = 50;

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.agent.findMany({ orderBy: { createdAt: 'desc' }, include: { executions: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  }

  async create(data: CreateAgentDto) {
    const userAgents = await this.prisma.agent.count({ where: { demo: false } });
    if (userAgents >= MAX_USER_AGENTS) throw new ForbiddenException('Agent limit reached for the public demo. Remove an existing agent first.');
    return this.prisma.agent.create({ data });
  }

  async update(id: string, data: UpdateAgentDto) {
    const agent = await this.get(id);
    if (agent.demo && data.status === 'PAUSED') throw new ForbiddenException('Demo agents cannot be paused.');
    return this.prisma.agent.update({ where: { id }, data });
  }

  async remove(id: string) {
    const agent = await this.get(id);
    if (agent.demo) throw new ForbiddenException('Demo agents cannot be deleted.');
    return this.prisma.agent.delete({ where: { id } });
  }

  async get(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }
}
