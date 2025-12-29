import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto, UpdateTeacherDto, TeacherResponseDto } from './dto';
import { UserRole } from '@prisma/client';

/**
 * Teachers Service
 * Handles all business logic for teacher management
 */
@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new teacher with user account
   */
  async create(createTeacherDto: CreateTeacherDto): Promise<TeacherResponseDto> {
    const { email, password, fullName } = createTeacherDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      // Create user and teacher in transaction
      const teacher = await this.prisma.$transaction(async (tx) => {
        // Create user account
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: UserRole.TEACHER,
          },
        });

        // Create teacher profile
        const newTeacher = await tx.teacher.create({
          data: {
            userId: user.id,
            fullName,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
        });

        return newTeacher;
      });

      this.logger.log(`Teacher created successfully: ${email}`);
      return teacher;
    } catch (error) {
      this.logger.error('Failed to create teacher', error);
      throw new BadRequestException('Failed to create teacher. Please try again.');
    }
  }

  /**
   * Find all teachers
   */
  async findAll(): Promise<TeacherResponseDto[]> {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        teachingAssignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            classroom: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return teachers;
  }

  /**
   * Find a teacher by ID
   */
  async findOne(id: string): Promise<TeacherResponseDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        teachingAssignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
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
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  /**
   * Find teacher by user ID
   */
  async findByUserId(userId: string): Promise<TeacherResponseDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        teachingAssignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            classroom: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with user ID ${userId} not found`);
    }

    return teacher;
  }

  /**
   * Update teacher information
   */
  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<TeacherResponseDto> {
    // Check if teacher exists
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Update teacher
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        teachingAssignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            classroom: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Teacher updated successfully: ${id}`);
    return updatedTeacher;
  }

  /**
   * Delete a teacher and associated user account
   */
  async remove(id: string): Promise<void> {
    // Check if teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        teachingAssignments: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Check if teacher has active teaching assignments
    if (teacher.teachingAssignments.length > 0) {
      throw new BadRequestException(
        'Cannot delete teacher with active teaching assignments. Please remove assignments first.',
      );
    }

    try {
      // Delete in transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.teacher.delete({
          where: { id },
        });

        await tx.user.delete({
          where: { id: teacher.userId },
        });
      });

      this.logger.log(`Teacher deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Failed to delete teacher', error);
      throw new BadRequestException('Failed to delete teacher. Please try again.');
    }
  }

  /**
   * Get teaching assignments for a teacher
   */
  async getTeachingAssignments(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        teachingAssignments: {
          include: {
            subject: true,
            classroom: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    return teacher.teachingAssignments;
  }

  /**
   * Get total teacher count
   */
  async count(): Promise<number> {
    return this.prisma.teacher.count();
  }
}
