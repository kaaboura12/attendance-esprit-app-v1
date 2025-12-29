import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating student information
 * All fields are optional
 */
export class UpdateStudentDto {
  @ApiPropertyOptional({
    description: 'Student full name',
    example: 'Ahmed Ben Ali Updated',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Student code/number',
    example: 'ESP202402',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiPropertyOptional({
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Classroom ID must be a valid UUID' })
  classroomId?: string;
}

