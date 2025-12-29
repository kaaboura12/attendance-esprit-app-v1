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
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto, UpdateClassroomDto, ClassroomResponseDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { UserRole } from '@prisma/client';

/**
 * Classrooms Controller
 * Handles all classroom-related HTTP requests
 */
@ApiTags('Classrooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  /**
   * Create a new classroom
   */
  @ApiOperation({
    summary: 'Create a new classroom',
    description: 'Create a new classroom. Admin only.',
  })
  @ApiCreatedResponse({
    description: 'Classroom created successfully',
    type: ClassroomResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Classroom name already exists',
  })
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClassroomDto: CreateClassroomDto): Promise<ClassroomResponseDto> {
    return this.classroomsService.create(createClassroomDto);
  }

  /**
   * Get all classrooms
   */
  @ApiOperation({
    summary: 'Get all classrooms',
    description: 'Retrieve all classrooms with optional filtering by level and department',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Filter by academic level (1-5)',
    example: 2,
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department code',
    example: 'GL',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of classrooms',
    type: [ClassroomResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll(
    @Query('level') level?: string,
    @Query('department') department?: string,
  ): Promise<ClassroomResponseDto[]> {
    const levelNum = level ? parseInt(level, 10) : undefined;
    return this.classroomsService.findAll(levelNum, department);
  }

  /**
   * Get classroom count
   */
  @ApiOperation({
    summary: 'Get total classroom count',
    description: 'Get the total number of classrooms',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classroom count',
    schema: {
      example: { count: 20 },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.classroomsService.count();
    return { count };
  }

  /**
   * Get classroom statistics
   */
  @ApiOperation({
    summary: 'Get classroom statistics',
    description: 'Get detailed statistics for a specific classroom',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classroom statistics',
    schema: {
      example: {
        classroomId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'GL2-A',
        level: 2,
        department: 'GL',
        studentCount: 25,
        teachingAssignmentCount: 8,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.classroomsService.getStatistics(id);
  }

  /**
   * Get students in a classroom
   */
  @ApiOperation({
    summary: 'Get classroom students',
    description: 'Retrieve all students enrolled in a specific classroom',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of students in classroom',
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/students')
  getStudents(@Param('id') id: string) {
    return this.classroomsService.getStudents(id);
  }

  /**
   * Get teaching assignments for a classroom
   */
  @ApiOperation({
    summary: 'Get classroom teaching assignments',
    description: 'Retrieve all teaching assignments for a specific classroom',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of teaching assignments',
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/assignments')
  getTeachingAssignments(@Param('id') id: string) {
    return this.classroomsService.getTeachingAssignments(id);
  }

  /**
   * Get classroom by name
   */
  @ApiOperation({
    summary: 'Get classroom by name',
    description: 'Retrieve a classroom by its unique name',
  })
  @ApiParam({
    name: 'name',
    description: 'Classroom name',
    example: 'GL2-A',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classroom found',
    type: ClassroomResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('name/:name')
  findByName(@Param('name') name: string): Promise<ClassroomResponseDto> {
    return this.classroomsService.findByName(name);
  }

  /**
   * Get a single classroom by ID
   */
  @ApiOperation({
    summary: 'Get classroom by ID',
    description: 'Retrieve detailed information about a specific classroom',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classroom found',
    type: ClassroomResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ClassroomResponseDto> {
    return this.classroomsService.findOne(id);
  }

  /**
   * Update a classroom
   */
  @ApiOperation({
    summary: 'Update classroom information',
    description: 'Update classroom details. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classroom updated successfully',
    type: ClassroomResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Classroom name already exists',
  })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ): Promise<ClassroomResponseDto> {
    return this.classroomsService.update(id, updateClassroomDto);
  }

  /**
   * Delete a classroom
   */
  @ApiOperation({
    summary: 'Delete a classroom',
    description: 'Delete a classroom. Cannot delete if classroom has enrolled students or teaching assignments. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Classroom UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Classroom deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  @ApiBadRequestResponse({
    description: 'Classroom has enrolled students or teaching assignments',
  })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.classroomsService.remove(id);
  }
}
