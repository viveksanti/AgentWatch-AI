import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExecutionsService } from './executions.service';
import { RunExecutionDto, TestExecutionDto } from './executions.dto';

@Controller('executions')
export class ExecutionsController {
  constructor(private executions: ExecutionsService) {}
  @Get() list(@Query('limit') limit?: string) { return this.executions.list(Number(limit) || 50); }
  @Get(':id') get(@Param('id') id: string) { return this.executions.get(id); }
  @Post(':agentId/run') run(@Param('agentId') id: string, @Body() dto: RunExecutionDto) { return this.executions.run(id, dto.task); }
  @Post(':agentId/run-document')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  runDocument(@Param('agentId') id: string, @Body() dto: RunExecutionDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Choose a document to upload');
    return this.executions.runDocument(id, dto.task, file);
  }
  @Post(':agentId/test') test(@Param('agentId') id: string, @Body() dto: TestExecutionDto) { return this.executions.test(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.executions.remove(id); }
}
