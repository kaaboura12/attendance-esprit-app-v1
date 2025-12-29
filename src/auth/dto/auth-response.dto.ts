import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

/**
 * User data returned in auth responses
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'student@esprit.tn',
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-12-29T10:00:00.000Z',
  })
  createdAt: Date;
}

/**
 * Authentication Response DTO
 * Contains access token and user information
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InN0dWRlbnRAZXNwcml0LnRuIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3MDM4NDQ0MDAsImV4cCI6MTcwMzkzMDgwMH0.example_signature',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

