import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto } from './agents.dto';

@Controller('agents')
export class AgentsController {
  constructor(private agents: AgentsService) {}
  @Get() list() { return this.agents.list(); }
  @Get(':id') get(@Param('id') id: string) { return this.agents.get(id); }
  @Post() create(@Body() dto: CreateAgentDto) { return this.agents.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateAgentDto) { return this.agents.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.agents.remove(id); }
}
