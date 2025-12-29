import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTeachingAssignmentDto,
  UpdateTeachingAssignmentDto,
  TeachingAssignmentResponseDto,
} from './dto';

/**
 * Teaching Assignments Service
 * Handles all business logic for teaching assignment management
 * Core business rule: One teacher teaches one subject to one classroom
 */
@Injectable()
export class TeachingAssignmentsService {
  private readonly logger = new Logger(TeachingAssignmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new teaching assignment
   * Validates that teacher, subject, and classroom exist
   * Ensures unique combination of teacher-subject-classroom
   */
  async create(
    createDto: CreateTeachingAssignmentDto,
  ): Promise<TeachingAssignmentResponseDto> {
    const { teacherId, subjectId, classroomId } = createDto;

    // Validate teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new BadRequestException(`Teacher with ID ${teacherId} not found`);
    }

    // Validate subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new BadRequestException(`Subject with ID ${subjectId} not found`);
    }

    // Validate classroom exists
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new BadRequestException(`Classroom with ID ${classroomId} not found`);
    }

    // Check if this exact assignment already exists
    const existingAssignment = await this.prisma.teachingAssignment.findUnique({
      where: {
        teacherId_subjectId_classroomId: {
          teacherId,
          subjectId,
          classroomId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        `Teaching assignment already exists: ${teacher.fullName} teaches ${subject.name} to ${classroom.name}`,
      );
    }

    try {
      const assignment = await this.prisma.teachingAssignment.create({
        data: {
          teacherId,
          subjectId,
          classroomId,
        },
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

      this.logger.log(
        `Teaching assignment created: ${teacher.fullName} → ${subject.code} → ${classroom.name}`,
      );
      return assignment;
    } catch (error) {
      this.logger.error('Failed to create teaching assignment', error);
      throw new BadRequestException('Failed to create teaching assignment. Please try again.');
    }
  }

  /**
   * Find all teaching assignments with optional filtering
   */
  async findAll(
    teacherId?: string,
    subjectId?: string,
    classroomId?: string,
  ): Promise<TeachingAssignmentResponseDto[]> {
    const where: any = {};

    if (teacherId) where.teacherId = teacherId;
    if (subjectId) where.subjectId = subjectId;
    if (classroomId) where.classroomId = classroomId;

    const assignments = await this.prisma.teachingAssignment.findMany({
      where,
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
        classroom: {
          select: {
            id: true,
            name: true,
            level: true,
            department: true,
          },
        },
      },
      orderBy: [
        { classroom: { level: 'asc' } },
        { classroom: { name: 'asc' } },
        { subject: { code: 'asc' } },
      ],
    });

    return assignments;
  }

  /**
   * Find a teaching assignment by ID
   */
  async findOne(id: string): Promise<TeachingAssignmentResponseDto> {
    const assignment = await this.prisma.teachingAssignment.findUnique({
      where: { id },
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
        classroom: {
          select: {
            id: true,
            name: true,
            level: true,
            department: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        sessions: {
          take: 10,
          orderBy: {
            startedAt: 'desc',
          },
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            status: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Teaching assignment with ID ${id} not found`);
    }

    return assignment;
  }

  /**
   * Get assignments by teacher
   */
  async findByTeacher(teacherId: string): Promise<TeachingAssignmentResponseDto[]> {
    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    return this.findAll(teacherId);
  }

  /**
   * Get assignments by subject
   */
  async findBySubject(subjectId: string): Promise<TeachingAssignmentResponseDto[]> {
    // Verify subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return this.findAll(undefined, subjectId);
  }

  /**
   * Get assignments by classroom
   */
  async findByClassroom(classroomId: string): Promise<TeachingAssignmentResponseDto[]> {
    // Verify classroom exists
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    return this.findAll(undefined, undefined, classroomId);
  }

  /**
   * Get assignments by department
   */
  async findByDepartment(department: string): Promise<TeachingAssignmentResponseDto[]> {
    const assignments = await this.prisma.teachingAssignment.findMany({
      where: {
        classroom: {
          department,
        },
      },
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
        classroom: {
          select: {
            id: true,
            name: true,
            level: true,
            department: true,
          },
        },
      },
      orderBy: [
        { classroom: { level: 'asc' } },
        { classroom: { name: 'asc' } },
      ],
    });

    return assignments;
  }

  /**
   * Get assignments by level
   */
  async findByLevel(level: number): Promise<TeachingAssignmentResponseDto[]> {
    if (level < 1 || level > 5) {
      throw new BadRequestException('Level must be between 1 and 5');
    }

    const assignments = await this.prisma.teachingAssignment.findMany({
      where: {
        classroom: {
          level,
        },
      },
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
        classroom: {
          select: {
            id: true,
            name: true,
            level: true,
            department: true,
          },
        },
      },
      orderBy: [
        { classroom: { name: 'asc' } },
        { subject: { code: 'asc' } },
      ],
    });

    return assignments;
  }

  /**
   * Update a teaching assignment
   */
  async update(
    id: string,
    updateDto: UpdateTeachingAssignmentDto,
  ): Promise<TeachingAssignmentResponseDto> {
    // Check if assignment exists
    const existingAssignment = await this.prisma.teachingAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      throw new NotFoundException(`Teaching assignment with ID ${id} not found`);
    }

    // Validate new teacher if provided
    if (updateDto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: updateDto.teacherId },
      });

      if (!teacher) {
        throw new BadRequestException(`Teacher with ID ${updateDto.teacherId} not found`);
      }
    }

    // Validate new subject if provided
    if (updateDto.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: updateDto.subjectId },
      });

      if (!subject) {
        throw new BadRequestException(`Subject with ID ${updateDto.subjectId} not found`);
      }
    }

    // Validate new classroom if provided
    if (updateDto.classroomId) {
      const classroom = await this.prisma.classroom.findUnique({
        where: { id: updateDto.classroomId },
      });

      if (!classroom) {
        throw new BadRequestException(`Classroom with ID ${updateDto.classroomId} not found`);
      }
    }

    // Check for conflicts with new combination
    if (updateDto.teacherId || updateDto.subjectId || updateDto.classroomId) {
      const newTeacherId = updateDto.teacherId || existingAssignment.teacherId;
      const newSubjectId = updateDto.subjectId || existingAssignment.subjectId;
      const newClassroomId = updateDto.classroomId || existingAssignment.classroomId;

      const conflictingAssignment = await this.prisma.teachingAssignment.findFirst({
        where: {
          teacherId: newTeacherId,
          subjectId: newSubjectId,
          classroomId: newClassroomId,
          id: { not: id },
        },
      });

      if (conflictingAssignment) {
        throw new ConflictException('This teaching assignment combination already exists');
      }
    }

    // Update assignment
    const updatedAssignment = await this.prisma.teachingAssignment.update({
      where: { id },
      data: updateDto,
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

    this.logger.log(`Teaching assignment updated successfully: ${id}`);
    return updatedAssignment;
  }

  /**
   * Delete a teaching assignment
   */
  async remove(id: string): Promise<void> {
    // Check if assignment exists
    const assignment = await this.prisma.teachingAssignment.findUnique({
      where: { id },
      include: {
        sessions: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Teaching assignment with ID ${id} not found`);
    }

    // Check if assignment has sessions
    if (assignment.sessions.length > 0) {
      throw new BadRequestException(
        `Cannot delete teaching assignment with ${assignment.sessions.length} existing session(s). Please delete sessions first.`,
      );
    }

    try {
      await this.prisma.teachingAssignment.delete({
        where: { id },
      });

      this.logger.log(`Teaching assignment deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Failed to delete teaching assignment', error);
      throw new BadRequestException('Failed to delete teaching assignment. Please try again.');
    }
  }

  /**
   * Get assignment statistics
   */
  async getStatistics(id: string) {
    const assignment = await this.prisma.teachingAssignment.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            fullName: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        classroom: {
          select: {
            name: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Teaching assignment with ID ${id} not found`);
    }

    return {
      assignmentId: assignment.id,
      teacher: assignment.teacher.fullName,
      subject: `${assignment.subject.code} - ${assignment.subject.name}`,
      classroom: assignment.classroom.name,
      studentCount: assignment.classroom._count.students,
      sessionCount: assignment._count.sessions,
    };
  }

  /**
   * Get total assignment count
   */
  async count(): Promise<number> {
    return this.prisma.teachingAssignment.count();
  }

  /**
   * Get count by teacher
   */
  async countByTeacher(teacherId: string): Promise<number> {
    return this.prisma.teachingAssignment.count({
      where: { teacherId },
    });
  }

  /**
   * Get count by subject
   */
  async countBySubject(subjectId: string): Promise<number> {
    return this.prisma.teachingAssignment.count({
      where: { subjectId },
    });
  }

  /**
   * Get count by classroom
   */
  async countByClassroom(classroomId: string): Promise<number> {
    return this.prisma.teachingAssignment.count({
      where: { classroomId },
    });
  }
}
