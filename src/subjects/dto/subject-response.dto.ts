import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Teaching assignment summary in subject response
 */
export class SubjectTeachingAssignmentDto {
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
      name: 'GL2-A',
    },
  })
  classroom: {
    id: string;
    name: string;
  };
}

/**
 * Complete subject response DTO
 */
export class SubjectResponseDto {
  @ApiProperty({
    description: 'Subject unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Flutter Development',
  })
  name: string;

  @ApiProperty({
    description: 'Subject code',
    example: 'FLUT301',
  })
  code: string;

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
    description: 'Teaching assignments for this subject',
    type: [SubjectTeachingAssignmentDto],
  })
  teachingAssignments?: SubjectTeachingAssignmentDto[];
}

