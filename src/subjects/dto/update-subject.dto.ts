import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating subject information
 * All fields are optional
 */
export class UpdateSubjectDto {
  @ApiPropertyOptional({
    description: 'Subject name',
    example: 'Advanced Flutter Development',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Subject code',
    example: 'FLUT302',
  })
  @IsOptional()
  @IsString()
  code?: string;
}

