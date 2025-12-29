import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating teaching assignment
 * All fields are optional
 */
export class UpdateTeachingAssignmentDto {
  @ApiPropertyOptional({
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Teacher ID must be a valid UUID' })
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Subject UUID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Subject ID must be a valid UUID' })
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Classroom ID must be a valid UUID' })
  classroomId?: string;
}

