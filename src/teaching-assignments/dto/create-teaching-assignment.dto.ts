import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new teaching assignment
 * Represents: One teacher teaches one subject to one classroom
 */
export class CreateTeachingAssignmentDto {
  @ApiProperty({
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Teacher ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Teacher ID is required' })
  teacherId: string;

  @ApiProperty({
    description: 'Subject UUID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Subject ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Subject ID is required' })
  subjectId: string;

  @ApiProperty({
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Classroom ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Classroom ID is required' })
  classroomId: string;
}

