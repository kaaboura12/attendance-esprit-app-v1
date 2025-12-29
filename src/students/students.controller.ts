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
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentResponseDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { UserRole } from '@prisma/client';

/**
 * Students Controller
 * Handles all student-related HTTP requests
 */
@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Create a new student
   * Admin only
   */
  @ApiOperation({
    summary: 'Create a new student',
    description: 'Create a new student account with user credentials. Admin only.',
  })
  @ApiCreatedResponse({
    description: 'Student created successfully',
    type: StudentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or classroom not found',
  })
  @ApiConflictResponse({
    description: 'Email or student code already exists',
  })
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStudentDto: CreateStudentDto): Promise<StudentResponseDto> {
    return this.studentsService.create(createStudentDto);
  }

  /**
   * Get all students
   * Teachers and Admins
   */
  @ApiOperation({
    summary: 'Get all students',
    description: 'Retrieve all students. Optionally filter by classroom.',
  })
  @ApiQuery({
    name: 'classroomId',
    required: false,
    description: 'Filter students by classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of students',
    type: [StudentResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll(@Query('classroomId') classroomId?: string): Promise<StudentResponseDto[]> {
    return this.studentsService.findAll(classroomId);
  }

  /**
   * Get student count
   * Admin and Teachers
   */
  @ApiOperation({
    summary: 'Get total student count',
    description: 'Get the total number of students in the system',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student count',
    schema: {
      example: { count: 150 },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.studentsService.count();
    return { count };
  }

  /**
   * Get students count by classroom
   * Admin and Teachers
   */
  @ApiOperation({
    summary: 'Get student count by classroom',
    description: 'Get the number of students in a specific classroom',
  })
  @ApiParam({
    name: 'classroomId',
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student count for classroom',
    schema: {
      example: { classroomId: '550e8400-e29b-41d4-a716-446655440000', count: 25 },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('classroom/:classroomId/count')
  async countByClassroom(
    @Param('classroomId') classroomId: string,
  ): Promise<{ classroomId: string; count: number }> {
    const count = await this.studentsService.countByClassroom(classroomId);
    return { classroomId, count };
  }

  /**
   * Get student by student code
   * Teachers and Admins
   */
  @ApiOperation({
    summary: 'Get student by student code',
    description: 'Retrieve a student by their unique student code',
  })
  @ApiParam({
    name: 'studentCode',
    description: 'Student code',
    example: 'ESP202401',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student found',
    type: StudentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('code/:studentCode')
  findByStudentCode(@Param('studentCode') studentCode: string): Promise<StudentResponseDto> {
    return this.studentsService.findByStudentCode(studentCode);
  }

  /**
   * Get a single student by ID
   * Teachers and Admins
   */
  @ApiOperation({
    summary: 'Get student by ID',
    description: 'Retrieve detailed information about a specific student',
  })
  @ApiParam({
    name: 'id',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student found',
    type: StudentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<StudentResponseDto> {
    return this.studentsService.findOne(id);
  }

  /**
   * Update a student
   * Admin only
   */
  @ApiOperation({
    summary: 'Update student information',
    description: 'Update student details. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student updated successfully',
    type: StudentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Student code already exists',
  })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.studentsService.update(id, updateStudentDto);
  }

  /**
   * Delete a student
   * Admin only
   */
  @ApiOperation({
    summary: 'Delete a student',
    description: 'Delete a student and their associated user account. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Student deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
  })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.studentsService.remove(id);
  }
}
