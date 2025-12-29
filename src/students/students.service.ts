import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto, StudentResponseDto } from './dto';
import { UserRole } from '@prisma/client';

/**
 * Students Service
 * Handles all business logic for student management
 */
@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new student with user account
   */
  async create(createStudentDto: CreateStudentDto): Promise<StudentResponseDto> {
    const { email, password, fullName, studentCode, classroomId } = createStudentDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      // Create user and student in transaction
      const student = await this.prisma.$transaction(async (tx) => {
        // Create user account
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: UserRole.STUDENT,
          },
        });

        // Create student profile
        const newStudent = await tx.student.create({
          data: {
            userId: user.id,
            studentCode,
            fullName,
            classroomId,
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
            classroom: {
              select: {
                id: true,
                name: true,
                level: true,
                department: true,
              },
            },
          },
        });

        return newStudent;
      });

      this.logger.log(`Student created successfully: ${studentCode}`);
      return student;
    } catch (error) {
      this.logger.error('Failed to create student', error);
      throw new BadRequestException('Failed to create student. Please try again.');
    }
  }

  /**
   * Find all students with optional filtering
   */
  async findAll(classroomId?: string): Promise<StudentResponseDto[]> {
    const where = classroomId ? { classroomId } : {};

    const students = await this.prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return students;
  }

  /**
   * Find a student by ID
   */
  async findOne(id: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
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
        classroom: {
          select: {
            id: true,
            name: true,
            level: true,
            department: true,
          },
        },
        attendanceRecords: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            session: {
              select: {
                id: true,
                startedAt: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  /**
   * Find student by student code
   */
  async findByStudentCode(studentCode: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
      where: { studentCode },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
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
    });

    if (!student) {
      throw new NotFoundException(`Student with code ${studentCode} not found`);
    }

    return student;
  }

  /**
   * Find student by user ID
   */
  async findByUserId(userId: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
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
        classroom: {
          select: {
            id: true,
            name: true,
            level: true,
            department: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with user ID ${userId} not found`);
    }

    return student;
  }

  /**
   * Update student information
   */
  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentResponseDto> {
    // Check if student exists
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // If updating student code, check for conflicts
    if (updateStudentDto.studentCode) {
      const codeExists = await this.prisma.student.findFirst({
        where: {
          studentCode: updateStudentDto.studentCode,
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new ConflictException('Student code already exists');
      }
    }

    // If updating classroom, verify it exists
    if (updateStudentDto.classroomId) {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: updateStudentDto.classroomId },
      });

      if (!classroom) {
        throw new BadRequestException('Classroom not found');
      }
    }

    // Update student
    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
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
    });

    this.logger.log(`Student updated successfully: ${id}`);
    return updatedStudent;
  }

  /**
   * Delete a student and associated user account
   */
  async remove(id: string): Promise<void> {
    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    try {
      // Delete in transaction (user deletion will cascade to student due to FK)
      await this.prisma.$transaction(async (tx) => {
        await tx.student.delete({
          where: { id },
        });

        await tx.user.delete({
          where: { id: student.userId },
        });
      });

      this.logger.log(`Student deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Failed to delete student', error);
      throw new BadRequestException('Failed to delete student. Please try again.');
    }
  }

  /**
   * Get student count by classroom
   */
  async countByClassroom(classroomId: string): Promise<number> {
    return this.prisma.student.count({
      where: { classroomId },
    });
  }

  /**
   * Get total student count
   */
  async count(): Promise<number> {
    return this.prisma.student.count();
  }
}
