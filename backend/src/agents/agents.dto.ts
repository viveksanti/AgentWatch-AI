import { IsIn, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateAgentDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @MinLength(2) type!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() systemPrompt?: string;
  @IsOptional() @IsString() provider?: string;
  @IsString() @MinLength(2) model!: string;
  @IsOptional() @IsNumber() @Min(0) @Max(2) temperature?: number;
}

export class UpdateAgentDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() @MinLength(2) type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() systemPrompt?: string;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(2) temperature?: number;
  @IsOptional() @IsIn(['ACTIVE', 'PAUSED']) status?: string;
}
