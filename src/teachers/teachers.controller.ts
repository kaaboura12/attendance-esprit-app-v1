import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto, TeacherResponseDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { UserRole } from '@prisma/client';

/**
 * Teachers Controller
 * Handles all teacher-related HTTP requests
 */
@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  /**
   * Create a new teacher
   * Admin only
   */
  @ApiOperation({
    summary: 'Create a new teacher',
    description: 'Create a new teacher account with user credentials. Admin only.',
  })
  @ApiCreatedResponse({
    description: 'Teacher created successfully',
    type: TeacherResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateTeacherDto): Promise<TeacherResponseDto> {
    return this.teachersService.create(createTeacherDto);
  }

  /**
   * Get all teachers
   * Admin and Teachers
   */
  @ApiOperation({
    summary: 'Get all teachers',
    description: 'Retrieve all teachers with their teaching assignments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of teachers',
    type: [TeacherResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll(): Promise<TeacherResponseDto[]> {
    return this.teachersService.findAll();
  }

  /**
   * Get teacher count
   * Admin only
   */
  @ApiOperation({
    summary: 'Get total teacher count',
    description: 'Get the total number of teachers in the system',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher count',
    schema: {
      example: { count: 25 },
    },
  })
  @Roles(UserRole.ADMIN)
  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.teachersService.count();
    return { count };
  }

  /**
   * Get a single teacher by ID
   * Admin and Teachers
   */
  @ApiOperation({
    summary: 'Get teacher by ID',
    description: 'Retrieve detailed information about a specific teacher including teaching assignments',
  })
  @ApiParam({
    name: 'id',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher found',
    type: TeacherResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<TeacherResponseDto> {
    return this.teachersService.findOne(id);
  }

  /**
   * Get teacher's teaching assignments
   * Admin and Teachers
   */
  @ApiOperation({
    summary: 'Get teacher teaching assignments',
    description: 'Retrieve all teaching assignments for a specific teacher',
  })
  @ApiParam({
    name: 'id',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teaching assignments',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440000',
          subject: {
            id: '770e8400-e29b-41d4-a716-446655440000',
            name: 'Flutter Development',
            code: 'FLUT301',
          },
          classroom: {
            id: '880e8400-e29b-41d4-a716-446655440000',
            name: 'GL2-A',
            level: 2,
            department: 'GL',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/assignments')
  getTeachingAssignments(@Param('id') id: string) {
    return this.teachersService.getTeachingAssignments(id);
  }

  /**
   * Update a teacher
   * Admin only
   */
  @ApiOperation({
    summary: 'Update teacher information',
    description: 'Update teacher details. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher updated successfully',
    type: TeacherResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<TeacherResponseDto> {
    return this.teachersService.update(id, updateTeacherDto);
  }

  /**
   * Delete a teacher
   * Admin only
   */
  @ApiOperation({
    summary: 'Delete a teacher',
    description: 'Delete a teacher and their associated user account. Cannot delete if teacher has active teaching assignments. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Teacher deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
  })
  @ApiBadRequestResponse({
    description: 'Teacher has active teaching assignments',
  })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.teachersService.remove(id);
  }
}
