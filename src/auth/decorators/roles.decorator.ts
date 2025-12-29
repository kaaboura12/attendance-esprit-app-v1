import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Roles Decorator
 * Restricts access to specific user roles
 * 
 * @example
 * @Roles(UserRole.ADMIN, UserRole.TEACHER)
 * @Get('admin-only')
 * adminEndpoint() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

