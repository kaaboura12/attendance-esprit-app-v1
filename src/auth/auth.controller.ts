import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { Public, CurrentUser, Roles } from './decorators';
import { JwtAuthGuard, LocalAuthGuard, RolesGuard } from './guards';
import { UserRole } from '@prisma/client';

/**
 * Authentication Controller
 * Handles all authentication-related endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   * 
   * @param registerDto - User registration data
   * @returns Access token and user information
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /auth/login
   * 
   * @param loginDto - User login credentials
   * @returns Access token and user information
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Get current user profile
   * GET /auth/profile
   * Requires JWT authentication
   * 
   * @param user - Current authenticated user (from JWT)
   * @returns User profile with role-specific data
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  /**
   * Get current user ID
   * GET /auth/me
   * Requires JWT authentication
   * 
   * @param user - Current authenticated user
   * @returns User object
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   * Requires JWT authentication
   * 
   * @param userId - Current user ID from JWT
   * @returns New access token
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@CurrentUser('id') userId: string) {
    const accessToken = await this.authService.refreshToken(userId);
    return { accessToken };
  }

  /**
   * Admin-only endpoint example
   * GET /auth/admin-test
   * Requires JWT authentication and ADMIN role
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-test')
  async adminOnly() {
    return {
      message: 'This endpoint is only accessible by admins',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Teacher and Admin endpoint example
   * GET /auth/teacher-test
   * Requires JWT authentication and TEACHER or ADMIN role
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get('teacher-test')
  async teacherOnly() {
    return {
      message: 'This endpoint is accessible by teachers and admins',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check endpoint
   * GET /auth/health
   * Public endpoint
   */
  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'authentication',
      timestamp: new Date().toISOString(),
    };
  }
}
