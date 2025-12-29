import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating teacher information
 * All fields are optional
 */
export class UpdateTeacherDto {
  @ApiPropertyOptional({
    description: 'Teacher full name',
    example: 'Dr. Mohamed Salah Updated',
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}

