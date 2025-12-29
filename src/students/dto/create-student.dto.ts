import { IsEmail, IsNotEmpty, IsString, IsUUID, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new student
 * Includes user account creation
 */
export class CreateStudentDto {
  @ApiProperty({
    description: 'Student email address (must be unique)',
    example: 'ahmed.benali@esprit.tn',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Student password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'Student@123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'Student full name',
    example: 'Ahmed Ben Ali',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @ApiProperty({
    description: 'Unique student code/number',
    example: 'ESP202401',
  })
  @IsString()
  @IsNotEmpty({ message: 'Student code is required' })
  studentCode: string;

  @ApiProperty({
    description: 'Classroom UUID the student belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Classroom ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Classroom ID is required' })
  classroomId: string;
}

