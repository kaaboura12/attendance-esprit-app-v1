import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto, SubjectResponseDto } from './dto';

/**
 * Subjects Service
 * Handles all business logic for subject management
 */
@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new subject
   */
  async create(createSubjectDto: CreateSubjectDto): Promise<SubjectResponseDto> {
    const { name, code } = createSubjectDto;

    // Check if subject code already exists
    const existingSubject = await this.prisma.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      throw new ConflictException(`Subject with code '${code}' already exists`);
    }

    try {
      const subject = await this.prisma.subject.create({
        data: {
          name,
          code,
        },
      });

      this.logger.log(`Subject created successfully: ${code}`);
      return subject;
    } catch (error) {
      this.logger.error('Failed to create subject', error);
      throw new BadRequestException('Failed to create subject. Please try again.');
    }
  }

  /**
   * Find all subjects
   */
  async findAll(): Promise<SubjectResponseDto[]> {
    const subjects = await this.prisma.subject.findMany({
      include: {
        _count: {
          select: {
            teachingAssignments: true,
          },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    return subjects;
  }

  /**
   * Find a subject by ID
   */
  async findOne(id: string): Promise<SubjectResponseDto> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        teachingAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
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

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  /**
   * Find subject by code
   */
  async findByCode(code: string): Promise<SubjectResponseDto> {
    const subject = await this.prisma.subject.findUnique({
      where: { code },
      include: {
        teachingAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
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

    if (!subject) {
      throw new NotFoundException(`Subject with code '${code}' not found`);
    }

    return subject;
  }

  /**
   * Search subjects by name
   */
  async searchByName(searchTerm: string): Promise<SubjectResponseDto[]> {
    return this.prisma.subject.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: {
            teachingAssignments: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Update subject information
   */
  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<SubjectResponseDto> {
    // Check if subject exists
    const existingSubject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // If updating code, check for conflicts
    if (updateSubjectDto.code) {
      const codeExists = await this.prisma.subject.findFirst({
        where: {
          code: updateSubjectDto.code,
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new ConflictException(`Subject with code '${updateSubjectDto.code}' already exists`);
      }
    }

    // Update subject
    const updatedSubject = await this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
      include: {
        teachingAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
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

    this.logger.log(`Subject updated successfully: ${id}`);
    return updatedSubject;
  }

  /**
   * Delete a subject
   */
  async remove(id: string): Promise<void> {
    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        teachingAssignments: true,
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Check if subject has teaching assignments
    if (subject.teachingAssignments.length > 0) {
      throw new BadRequestException(
        `Cannot delete subject with ${subject.teachingAssignments.length} active teaching assignment(s). Please remove assignments first.`,
      );
    }

    try {
      await this.prisma.subject.delete({
        where: { id },
      });

      this.logger.log(`Subject deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Failed to delete subject', error);
      throw new BadRequestException('Failed to delete subject. Please try again.');
    }
  }

  /**
   * Get teaching assignments for a subject
   */
  async getTeachingAssignments(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
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

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return subject.teachingAssignments;
  }

  /**
   * Get teachers teaching this subject
   */
  async getTeachers(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
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
          },
          distinct: ['teacherId'],
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    // Extract unique teachers
    const teachers = subject.teachingAssignments.map((assignment) => assignment.teacher);
    return teachers;
  }

  /**
   * Get classrooms where this subject is taught
   */
  async getClassrooms(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        teachingAssignments: {
          include: {
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

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return subject.teachingAssignments.map((assignment) => assignment.classroom);
  }

  /**
   * Get subject statistics
   */
  async getStatistics(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        _count: {
          select: {
            teachingAssignments: true,
          },
        },
        teachingAssignments: {
          include: {
            classroom: {
              include: {
                _count: {
                  select: {
                    students: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    // Calculate total students across all classrooms
    const totalStudents = subject.teachingAssignments.reduce(
      (sum, assignment) => sum + assignment.classroom._count.students,
      0,
    );

    return {
      subjectId: subject.id,
      code: subject.code,
      name: subject.name,
      teachingAssignmentCount: subject._count.teachingAssignments,
      totalStudents,
    };
  }

  /**
   * Get total subject count
   */
  async count(): Promise<number> {
    return this.prisma.subject.count();
  }
}
