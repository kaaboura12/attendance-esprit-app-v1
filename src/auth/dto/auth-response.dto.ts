import { UserRole } from '@prisma/client';

/**
 * User data returned in auth responses
 */
export class UserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Authentication Response DTO
 * Contains access token and user information
 */
export class AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}

