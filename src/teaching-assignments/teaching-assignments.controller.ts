import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import {
  CreateTeachingAssignmentDto,
  UpdateTeachingAssignmentDto,
  TeachingAssignmentResponseDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { UserRole } from '@prisma/client';

/**
 * Teaching Assignments Controller
 * Handles teacher-subject-classroom assignment relationships
 * Core business rule: One teacher teaches one subject to one classroom
 */
@ApiTags('Teaching Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teaching-assignments')
export class TeachingAssignmentsController {
  constructor(private readonly teachingAssignmentsService: TeachingAssignmentsService) {}

  /**
   * Create a new teaching assignment
   */
  @ApiOperation({
    summary: 'Create a new teaching assignment',
    description: 'Assign a teacher to teach a subject in a specific classroom. Admin only.',
  })
  @ApiCreatedResponse({
    description: 'Teaching assignment created successfully',
    type: TeachingAssignmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or referenced entities not found',
  })
  @ApiConflictResponse({
    description: 'This teaching assignment combination already exists',
  })
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDto: CreateTeachingAssignmentDto,
  ): Promise<TeachingAssignmentResponseDto> {
    return this.teachingAssignmentsService.create(createDto);
  }

  /**
   * Get all teaching assignments
   */
  @ApiOperation({
    summary: 'Get all teaching assignments',
    description: 'Retrieve all teaching assignments with optional filtering by teacher, subject, or classroom',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    description: 'Filter by teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by subject UUID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'classroomId',
    required: false,
    description: 'Filter by classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of teaching assignments',
    type: [TeachingAssignmentResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll(
    @Query('teacherId') teacherId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('classroomId') classroomId?: string,
  ): Promise<TeachingAssignmentResponseDto[]> {
    return this.teachingAssignmentsService.findAll(teacherId, subjectId, classroomId);
  }

  /**
   * Get assignment count
   */
  @ApiOperation({
    summary: 'Get total assignment count',
    description: 'Get the total number of teaching assignments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment count',
    schema: {
      example: { count: 45 },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.teachingAssignmentsService.count();
    return { count };
  }

  /**
   * Get assignments by teacher
   */
  @ApiOperation({
    summary: 'Get assignments by teacher',
    description: 'Retrieve all teaching assignments for a specific teacher',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of teacher assignments',
    type: [TeachingAssignmentResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId') teacherId: string): Promise<TeachingAssignmentResponseDto[]> {
    return this.teachingAssignmentsService.findByTeacher(teacherId);
  }

  /**
   * Get assignments by subject
   */
  @ApiOperation({
    summary: 'Get assignments by subject',
    description: 'Retrieve all teaching assignments for a specific subject',
  })
  @ApiParam({
    name: 'subjectId',
    description: 'Subject UUID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of subject assignments',
    type: [TeachingAssignmentResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId') subjectId: string): Promise<TeachingAssignmentResponseDto[]> {
    return this.teachingAssignmentsService.findBySubject(subjectId);
  }

  /**
   * Get assignments by classroom
   */
  @ApiOperation({
    summary: 'Get assignments by classroom',
    description: 'Retrieve all teaching assignments for a specific classroom',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of classroom assignments',
    type: [TeachingAssignmentResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('classroom/:classroomId')
  findByClassroom(
    @Param('classroomId') classroomId: string,
  ): Promise<TeachingAssignmentResponseDto[]> {
    return this.teachingAssignmentsService.findByClassroom(classroomId);
  }

  /**
   * Get assignments by department
   */
  @ApiOperation({
    summary: 'Get assignments by department',
    description: 'Retrieve all teaching assignments for a specific department',
  })
  @ApiParam({
    name: 'department',
    description: 'Department code',
    example: 'GL',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of department assignments',
    type: [TeachingAssignmentResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('department/:department')
  findByDepartment(
    @Param('department') department: string,
  ): Promise<TeachingAssignmentResponseDto[]> {
    return this.teachingAssignmentsService.findByDepartment(department);
  }

  /**
   * Get assignments by level
   */
  @ApiOperation({
    summary: 'Get assignments by level',
    description: 'Retrieve all teaching assignments for a specific academic level',
  })
  @ApiParam({
    name: 'level',
    description: 'Academic level (1-5)',
    example: 2,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of level assignments',
    type: [TeachingAssignmentResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid level (must be 1-5)',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('level/:level')
  findByLevel(@Param('level') level: string): Promise<TeachingAssignmentResponseDto[]> {
    return this.teachingAssignmentsService.findByLevel(parseInt(level, 10));
  }

  /**
   * Get assignment statistics
   */
  @ApiOperation({
    summary: 'Get assignment statistics',
    description: 'Get detailed statistics for a specific teaching assignment',
  })
  @ApiParam({
    name: 'id',
    description: 'Teaching assignment UUID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment statistics',
    schema: {
      example: {
        assignmentId: '880e8400-e29b-41d4-a716-446655440000',
        teacher: 'Dr. Mohamed Salah',
        subject: 'FLUT301 - Flutter Development',
        classroom: 'GL2-A',
        studentCount: 25,
        sessionCount: 12,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Assignment not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.teachingAssignmentsService.getStatistics(id);
  }

  /**
   * Get a single teaching assignment by ID
   */
  @ApiOperation({
    summary: 'Get teaching assignment by ID',
    description: 'Retrieve detailed information about a specific teaching assignment',
  })
  @ApiParam({
    name: 'id',
    description: 'Teaching assignment UUID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teaching assignment found',
    type: TeachingAssignmentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Teaching assignment not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<TeachingAssignmentResponseDto> {
    return this.teachingAssignmentsService.findOne(id);
  }

  /**
   * Update a teaching assignment
   */
  @ApiOperation({
    summary: 'Update teaching assignment',
    description: 'Update teaching assignment details. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Teaching assignment UUID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teaching assignment updated successfully',
    type: TeachingAssignmentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Teaching assignment not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or referenced entities not found',
  })
  @ApiConflictResponse({
    description: 'New combination already exists',
  })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTeachingAssignmentDto,
  ): Promise<TeachingAssignmentResponseDto> {
    return this.teachingAssignmentsService.update(id, updateDto);
  }

  /**
   * Delete a teaching assignment
   */
  @ApiOperation({
    summary: 'Delete a teaching assignment',
    description: 'Delete a teaching assignment. Cannot delete if assignment has existing sessions. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Teaching assignment UUID',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Teaching assignment deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Teaching assignment not found',
  })
  @ApiBadRequestResponse({
    description: 'Assignment has existing sessions',
  })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.teachingAssignmentsService.remove(id);
  }
}
