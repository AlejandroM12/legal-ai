import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AgentDto {
  @IsString()
  @MinLength(2)
  message!: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  documentIds?: string[];
}
