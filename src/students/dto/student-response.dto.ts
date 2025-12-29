import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Classroom information in student response
 */
export class ClassroomInfoDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'GL2-A' })
  name: string;

  @ApiProperty({ example: 2 })
  level: number;

  @ApiProperty({ example: 'GL' })
  department: string;
}

/**
 * User information in student response
 */
export class UserInfoDto {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'student@esprit.tn' })
  email: string;

  @ApiProperty({ example: 'STUDENT' })
  role: string;

  @ApiProperty({ example: '2025-12-29T10:00:00.000Z' })
  createdAt: Date;
}

/**
 * Complete student response DTO
 */
export class StudentResponseDto {
  @ApiProperty({
    description: 'Student unique identifier',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID reference',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'Student code/number',
    example: 'ESP202401',
  })
  studentCode: string;

  @ApiProperty({
    description: 'Student full name',
    example: 'Ahmed Ben Ali',
  })
  fullName: string;

  @ApiProperty({
    description: 'Classroom ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
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
    description: 'Classroom details',
    type: ClassroomInfoDto,
  })
  classroom?: ClassroomInfoDto;

  @ApiPropertyOptional({
    description: 'User account details',
    type: UserInfoDto,
  })
  user?: UserInfoDto;
}

