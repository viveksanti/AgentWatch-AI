import { IsOptional, IsString, MinLength } from 'class-validator';
export class RunExecutionDto { @IsString() @MinLength(1) task!: string; }

export class TestExecutionDto {
  @IsOptional() @IsString() @MinLength(1) task?: string;
  @IsOptional() @IsString() expectedKeyword?: string;
}
