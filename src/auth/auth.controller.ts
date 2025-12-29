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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { Public, CurrentUser, Roles } from './decorators';
import { JwtAuthGuard, LocalAuthGuard, RolesGuard } from './guards';
import { UserRole } from '@prisma/client';

/**
 * Authentication Controller
 * Handles all authentication-related endpoints
 */
@ApiTags('Authentication')
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
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with role-based profile (Student/Teacher/Admin). Students require studentCode and classroomId.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or missing required fields',
    schema: {
      example: {
        statusCode: 400,
        message: ['Password must contain at least one uppercase letter', 'Student code is required for student registration'],
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: 'User with this email or student code already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password, returns JWT access token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'Password is required'],
        error: 'Bad Request',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve detailed profile information for the authenticated user including role-specific data',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'student@esprit.tn',
        role: 'STUDENT',
        createdAt: '2025-12-29T10:00:00.000Z',
        student: {
          id: '660e8400-e29b-41d4-a716-446655440000',
          studentCode: 'ESP202401',
          fullName: 'Ahmed Ben Ali',
          classroomId: '770e8400-e29b-41d4-a716-446655440000',
          classroom: {
            id: '770e8400-e29b-41d4-a716-446655440000',
            name: 'GL2-A',
            level: 2,
            department: 'GL',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get basic information about the currently authenticated user from JWT token',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user information',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'student@esprit.tn',
        role: 'STUDENT',
        createdAt: '2025-12-29T10:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated',
  })
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
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate a new JWT access token for the authenticated user',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New access token generated',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated',
  })
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
  @ApiOperation({
    summary: 'Admin-only test endpoint',
    description: 'Example endpoint that requires ADMIN role',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success response for admin users',
    schema: {
      example: {
        message: 'This endpoint is only accessible by admins',
        timestamp: '2025-12-29T10:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have ADMIN role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Teacher and Admin test endpoint',
    description: 'Example endpoint that requires TEACHER or ADMIN role',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success response for teacher and admin users',
    schema: {
      example: {
        message: 'This endpoint is accessible by teachers and admins',
        timestamp: '2025-12-29T10:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have TEACHER or ADMIN role',
  })
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
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the authentication service is running',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        service: 'authentication',
        timestamp: '2025-12-29T10:00:00.000Z',
      },
    },
  })
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
