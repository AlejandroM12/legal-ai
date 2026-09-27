import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class SearchDto {
  @IsString()
  @MinLength(2)
  query!: string;

  @IsOptional()
  @IsUUID()
  documentId?: string;
}
