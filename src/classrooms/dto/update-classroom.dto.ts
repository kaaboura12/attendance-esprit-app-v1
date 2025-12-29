import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating classroom information
 * All fields are optional
 */
export class UpdateClassroomDto {
  @ApiPropertyOptional({
    description: 'Classroom name',
    example: 'GL2-B',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Academic level (1-5)',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Level must be an integer' })
  @Min(1, { message: 'Level must be at least 1' })
  @Max(5, { message: 'Level must not exceed 5' })
  level?: number;

  @ApiPropertyOptional({
    description: 'Department code',
    example: 'GL',
  })
  @IsOptional()
  @IsString()
  department?: string;
}

