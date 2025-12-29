import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassroomDto, UpdateClassroomDto, ClassroomResponseDto } from './dto';

/**
 * Classrooms Service
 * Handles all business logic for classroom management
 */
@Injectable()
export class ClassroomsService {
  private readonly logger = new Logger(ClassroomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new classroom
   */
  async create(createClassroomDto: CreateClassroomDto): Promise<ClassroomResponseDto> {
    const { name, level, department } = createClassroomDto;

    // Check if classroom name already exists
    const existingClassroom = await this.prisma.classroom.findUnique({
      where: { name },
    });

    if (existingClassroom) {
      throw new ConflictException(`Classroom with name '${name}' already exists`);
    }

    try {
      const classroom = await this.prisma.classroom.create({
        data: {
          name,
          level,
          department,
        },
      });

      this.logger.log(`Classroom created successfully: ${name}`);
      return classroom;
    } catch (error) {
      this.logger.error('Failed to create classroom', error);
      throw new BadRequestException('Failed to create classroom. Please try again.');
    }
  }

  /**
   * Find all classrooms with optional filtering
   */
  async findAll(level?: number, department?: string): Promise<ClassroomResponseDto[]> {
    const where: any = {};
    
    if (level !== undefined) {
      where.level = level;
    }
    
    if (department) {
      where.department = department;
    }

    const classrooms = await this.prisma.classroom.findMany({
      where,
      include: {
        _count: {
          select: {
            students: true,
            teachingAssignments: true,
          },
        },
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
    });

    return classrooms;
  }

  /**
   * Find a classroom by ID
   */
  async findOne(id: string): Promise<ClassroomResponseDto> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            studentCode: true,
            fullName: true,
          },
          orderBy: {
            fullName: 'asc',
          },
        },
        teachingAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    return classroom;
  }

  /**
   * Find classroom by name
   */
  async findByName(name: string): Promise<ClassroomResponseDto> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { name },
      include: {
        students: {
          select: {
            id: true,
            studentCode: true,
            fullName: true,
          },
        },
        teachingAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom '${name}' not found`);
    }

    return classroom;
  }

  /**
   * Get classrooms by level
   */
  async findByLevel(level: number): Promise<ClassroomResponseDto[]> {
    if (level < 1 || level > 5) {
      throw new BadRequestException('Level must be between 1 and 5');
    }

    return this.prisma.classroom.findMany({
      where: { level },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get classrooms by department
   */
  async findByDepartment(department: string): Promise<ClassroomResponseDto[]> {
    return this.prisma.classroom.findMany({
      where: { department },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Update classroom information
   */
  async update(id: string, updateClassroomDto: UpdateClassroomDto): Promise<ClassroomResponseDto> {
    // Check if classroom exists
    const existingClassroom = await this.prisma.classroom.findUnique({
      where: { id },
    });

    if (!existingClassroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    // If updating name, check for conflicts
    if (updateClassroomDto.name) {
      const nameExists = await this.prisma.classroom.findFirst({
        where: {
          name: updateClassroomDto.name,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new ConflictException(`Classroom with name '${updateClassroomDto.name}' already exists`);
      }
    }

    // Update classroom
    const updatedClassroom = await this.prisma.classroom.update({
      where: { id },
      data: updateClassroomDto,
      include: {
        students: {
          select: {
            id: true,
            studentCode: true,
            fullName: true,
          },
        },
      },
    });

    this.logger.log(`Classroom updated successfully: ${id}`);
    return updatedClassroom;
  }

  /**
   * Delete a classroom
   */
  async remove(id: string): Promise<void> {
    // Check if classroom exists
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        students: true,
        teachingAssignments: true,
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    // Check if classroom has students
    if (classroom.students.length > 0) {
      throw new BadRequestException(
        `Cannot delete classroom with ${classroom.students.length} enrolled student(s). Please reassign students first.`,
      );
    }

    // Check if classroom has teaching assignments
    if (classroom.teachingAssignments.length > 0) {
      throw new BadRequestException(
        `Cannot delete classroom with ${classroom.teachingAssignments.length} active teaching assignment(s). Please remove assignments first.`,
      );
    }

    try {
      await this.prisma.classroom.delete({
        where: { id },
      });

      this.logger.log(`Classroom deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Failed to delete classroom', error);
      throw new BadRequestException('Failed to delete classroom. Please try again.');
    }
  }

  /**
   * Get students in a classroom
   */
  async getStudents(classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: {
          select: {
            id: true,
            studentCode: true,
            fullName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
          orderBy: {
            fullName: 'asc',
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    return classroom.students;
  }

  /**
   * Get teaching assignments for a classroom
   */
  async getTeachingAssignments(classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        teachingAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    return classroom.teachingAssignments;
  }

  /**
   * Get classroom statistics
   */
  async getStatistics(classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        _count: {
          select: {
            students: true,
            teachingAssignments: true,
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    return {
      classroomId: classroom.id,
      name: classroom.name,
      level: classroom.level,
      department: classroom.department,
      studentCount: classroom._count.students,
      teachingAssignmentCount: classroom._count.teachingAssignments,
    };
  }

  /**
   * Get total classroom count
   */
  async count(): Promise<number> {
    return this.prisma.classroom.count();
  }

  /**
   * Get classroom count by level
   */
  async countByLevel(level: number): Promise<number> {
    return this.prisma.classroom.count({
      where: { level },
    });
  }

  /**
   * Get classroom count by department
   */
  async countByDepartment(department: string): Promise<number> {
    return this.prisma.classroom.count({
      where: { department },
    });
  }
}
