import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Student summary in classroom response
 */
export class StudentSummaryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'ESP202401' })
  studentCode: string;

  @ApiProperty({ example: 'Ahmed Ben Ali' })
  fullName: string;
}

/**
 * Teaching assignment summary in classroom response
 */
export class ClassroomTeachingAssignmentDto {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({
    example: {
      id: '770e8400-e29b-41d4-a716-446655440000',
      fullName: 'Dr. Mohamed Salah',
    },
  })
  teacher: {
    id: string;
    fullName: string;
  };

  @ApiProperty({
    example: {
      id: '880e8400-e29b-41d4-a716-446655440000',
      name: 'Flutter Development',
      code: 'FLUT301',
    },
  })
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * Complete classroom response DTO
 */
export class ClassroomResponseDto {
  @ApiProperty({
    description: 'Classroom unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Classroom name',
    example: 'GL2-A',
  })
  name: string;

  @ApiProperty({
    description: 'Academic level',
    example: 2,
  })
  level: number;

  @ApiProperty({
    description: 'Department code',
    example: 'GL',
  })
  department: string;

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
    description: 'Students in this classroom',
    type: [StudentSummaryDto],
  })
  students?: StudentSummaryDto[];

  @ApiPropertyOptional({
    description: 'Teaching assignments for this classroom',
    type: [ClassroomTeachingAssignmentDto],
  })
  teachingAssignments?: ClassroomTeachingAssignmentDto[];
}

