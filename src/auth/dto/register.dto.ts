import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * Data Transfer Object for User Registration
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsEnum(UserRole, { message: 'Role must be either STUDENT, TEACHER, or ADMIN' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  // Optional: For students only
  studentCode?: string;

  // Optional: For students only
  classroomId?: string;
}

