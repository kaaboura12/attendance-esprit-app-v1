import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * User information in teacher response
 */
export class TeacherUserInfoDto {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'teacher@esprit.tn' })
  email: string;

  @ApiProperty({ example: 'TEACHER' })
  role: string;

  @ApiProperty({ example: '2025-12-29T10:00:00.000Z' })
  createdAt: Date;
}

/**
 * Teaching assignment summary
 */
export class TeachingAssignmentSummaryDto {
  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({
    example: {
      id: '990e8400-e29b-41d4-a716-446655440000',
      name: 'Flutter Development',
      code: 'FLUT301',
    },
  })
  subject: {
    id: string;
    name: string;
    code: string;
  };

  @ApiProperty({
    example: {
      id: 'aa0e8400-e29b-41d4-a716-446655440000',
      name: 'GL2-A',
    },
  })
  classroom: {
    id: string;
    name: string;
  };
}

/**
 * Complete teacher response DTO
 */
export class TeacherResponseDto {
  @ApiProperty({
    description: 'Teacher unique identifier',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID reference',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'Teacher full name',
    example: 'Dr. Mohamed Salah',
  })
  fullName: string;

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
    description: 'User account details',
    type: TeacherUserInfoDto,
  })
  user?: TeacherUserInfoDto;

  @ApiPropertyOptional({
    description: 'Teaching assignments',
    type: [TeachingAssignmentSummaryDto],
  })
  teachingAssignments?: TeachingAssignmentSummaryDto[];
}

