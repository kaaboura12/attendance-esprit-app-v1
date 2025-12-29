import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';
import { UserRole } from '@prisma/client';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * Authentication Service
 * Handles user registration, login, password hashing, and JWT token generation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * Creates user account and associated student/teacher profile based on role
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, role, fullName, studentCode, classroomId } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate student-specific fields
    if (role === UserRole.STUDENT) {
      if (!studentCode) {
        throw new BadRequestException('Student code is required for student registration');
      }
      if (!classroomId) {
        throw new BadRequestException('Classroom ID is required for student registration');
      }

      // Check if student code already exists
      const existingStudent = await this.prisma.student.findUnique({
        where: { studentCode },
      });

      if (existingStudent) {
        throw new ConflictException('Student with this student code already exists');
      }

      // Verify classroom exists
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: classroomId },
      });

      if (!classroom) {
        throw new BadRequestException('Classroom not found');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    try {
      // Create user with transaction to ensure data consistency
      const user = await this.prisma.$transaction(async (tx) => {
        // Create base user
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role,
          },
        });

        // Create role-specific profile
        if (role === UserRole.STUDENT) {
          await tx.student.create({
            data: {
              userId: newUser.id,
              studentCode: studentCode!,
              fullName,
              classroomId: classroomId!,
            },
          });
        } else if (role === UserRole.TEACHER) {
          await tx.teacher.create({
            data: {
              userId: newUser.id,
              fullName,
            },
          });
        }

        return newUser;
      });

      this.logger.log(`User registered successfully: ${email} (${role})`);

      // Generate JWT token
      const accessToken = await this.generateToken(user.id, user.email, user.role);

      return {
        accessToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  /**
   * Login user
   * Validates credentials and returns JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(user.id, user.email, user.role);

    this.logger.log(`User logged in: ${email}`);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Validate user credentials
   * Used by LocalStrategy
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Remove password from user object
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            fullName: true,
            classroomId: true,
            classroom: {
              select: {
                id: true,
                name: true,
                level: true,
                department: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate JWT token
   */
  private async generateToken(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.signAsync(payload);
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare plain text password with hashed password
   */
  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Refresh token (optional - for future implementation)
   */
  async refreshToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateToken(user.id, user.email, user.role);
  }
}
