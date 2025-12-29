import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

/**
 * Data Transfer Object for User Registration
 */
export class RegisterDto {
  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'student@esprit.tn',
    type: String,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'Student@123',
    type: String,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.STUDENT,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole, { message: 'Role must be either STUDENT, TEACHER, or ADMIN' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Ahmed Ben Ali',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Student code (required for STUDENT role only)',
    example: 'ESP202401',
    type: String,
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiPropertyOptional({
    description: 'Classroom UUID (required for STUDENT role only)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsOptional()
  @IsUUID()
  classroomId?: string;
}

