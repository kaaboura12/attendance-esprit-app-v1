import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Teacher information in teaching assignment response
 */
export class AssignmentTeacherDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Dr. Mohamed Salah' })
  fullName: string;

  @ApiPropertyOptional({
    example: {
      email: 'teacher@esprit.tn',
    },
  })
  user?: {
    email: string;
  };
}

/**
 * Subject information in teaching assignment response
 */
export class AssignmentSubjectDto {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Flutter Development' })
  name: string;

  @ApiProperty({ example: 'FLUT301' })
  code: string;
}

/**
 * Classroom information in teaching assignment response
 */
export class AssignmentClassroomDto {
  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'GL2-A' })
  name: string;

  @ApiProperty({ example: 2 })
  level: number;

  @ApiProperty({ example: 'GL' })
  department: string;
}

/**
 * Complete teaching assignment response DTO
 */
export class TeachingAssignmentResponseDto {
  @ApiProperty({
    description: 'Teaching assignment unique identifier',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Teacher ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  teacherId: string;

  @ApiProperty({
    description: 'Subject ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  subjectId: string;

  @ApiProperty({
    description: 'Classroom ID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  classroomId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-29T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-12-29T10:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Teacher details',
    type: AssignmentTeacherDto,
  })
  teacher?: AssignmentTeacherDto;

  @ApiPropertyOptional({
    description: 'Subject details',
    type: AssignmentSubjectDto,
  })
  subject?: AssignmentSubjectDto;

  @ApiPropertyOptional({
    description: 'Classroom details',
    type: AssignmentClassroomDto,
  })
  classroom?: AssignmentClassroomDto;
}

