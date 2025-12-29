import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for User Login
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'student@esprit.tn',
    type: String,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Student@123',
    type: String,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

