import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new teacher
 * Includes user account creation
 */
export class CreateTeacherDto {
  @ApiProperty({
    description: 'Teacher email address (must be unique)',
    example: 'mohamed.salah@esprit.tn',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Teacher password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'Teacher@123',
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
    description: 'Teacher full name',
    example: 'Dr. Mohamed Salah',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;
}

