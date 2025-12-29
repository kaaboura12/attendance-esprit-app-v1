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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto, SubjectResponseDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { UserRole } from '@prisma/client';

/**
 * Subjects Controller
 * Handles all subject-related HTTP requests
 */
@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  /**
   * Create a new subject
   */
  @ApiOperation({
    summary: 'Create a new subject',
    description: 'Create a new subject/course. Admin only.',
  })
  @ApiCreatedResponse({
    description: 'Subject created successfully',
    type: SubjectResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Subject code already exists',
  })
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<SubjectResponseDto> {
    return this.subjectsService.create(createSubjectDto);
  }

  /**
   * Get all subjects
   */
  @ApiOperation({
    summary: 'Get all subjects',
    description: 'Retrieve all subjects/courses',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of subjects',
    type: [SubjectResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll(): Promise<SubjectResponseDto[]> {
    return this.subjectsService.findAll();
  }

  /**
   * Get subject count
   */
  @ApiOperation({
    summary: 'Get total subject count',
    description: 'Get the total number of subjects',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject count',
    schema: {
      example: { count: 15 },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.subjectsService.count();
    return { count };
  }

  /**
   * Search subjects by name
   */
  @ApiOperation({
    summary: 'Search subjects by name',
    description: 'Search for subjects by name (case-insensitive partial match)',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search term',
    example: 'Flutter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results',
    type: [SubjectResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('search')
  searchByName(@Query('q') searchTerm: string): Promise<SubjectResponseDto[]> {
    return this.subjectsService.searchByName(searchTerm);
  }

  /**
   * Get subject statistics
   */
  @ApiOperation({
    summary: 'Get subject statistics',
    description: 'Get detailed statistics for a specific subject including total students',
  })
  @ApiParam({
    name: 'id',
    description: 'Subject UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject statistics',
    schema: {
      example: {
        subjectId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'FLUT301',
        name: 'Flutter Development',
        teachingAssignmentCount: 3,
        totalStudents: 75,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.subjectsService.getStatistics(id);
  }

  /**
   * Get teaching assignments for a subject
   */
  @ApiOperation({
    summary: 'Get subject teaching assignments',
    description: 'Retrieve all teaching assignments for a specific subject',
  })
  @ApiParam({
    name: 'id',
    description: 'Subject UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of teaching assignments',
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/assignments')
  getTeachingAssignments(@Param('id') id: string) {
    return this.subjectsService.getTeachingAssignments(id);
  }

  /**
   * Get teachers teaching this subject
   */
  @ApiOperation({
    summary: 'Get teachers teaching this subject',
    description: 'Retrieve all teachers who teach this subject',
  })
  @ApiParam({
    name: 'id',
    description: 'Subject UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of teachers',
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/teachers')
  getTeachers(@Param('id') id: string) {
    return this.subjectsService.getTeachers(id);
  }

  /**
   * Get classrooms where this subject is taught
   */
  @ApiOperation({
    summary: 'Get classrooms for this subject',
    description: 'Retrieve all classrooms where this subject is taught',
  })
  @ApiParam({
    name: 'id',
    description: 'Subject UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of classrooms',
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id/classrooms')
  getClassrooms(@Param('id') id: string) {
    return this.subjectsService.getClassrooms(id);
  }

  /**
   * Get subject by code
   */
  @ApiOperation({
    summary: 'Get subject by code',
    description: 'Retrieve a subject by its unique code',
  })
  @ApiParam({
    name: 'code',
    description: 'Subject code',
    example: 'FLUT301',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject found',
    type: SubjectResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<SubjectResponseDto> {
    return this.subjectsService.findByCode(code);
  }

  /**
   * Get a single subject by ID
   */
  @ApiOperation({
    summary: 'Get subject by ID',
    description: 'Retrieve detailed information about a specific subject',
  })
  @ApiParam({
    name: 'id',
    description: 'Subject UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject found',
    type: SubjectResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<SubjectResponseDto> {
    return this.subjectsService.findOne(id);
  }

  /**
   * Update a subject
   */
  @ApiOperation({
    summary: 'Update subject information',
    description: 'Update subject details. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Subject UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject updated successfully',
    type: SubjectResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiConflictResponse({
    description: 'Subject code already exists',
  })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ): Promise<SubjectResponseDto> {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  /**
   * Delete a subject
   */
  @ApiOperation({
    summary: 'Delete a subject',
    description: 'Delete a subject. Cannot delete if subject has active teaching assignments. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Subject UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Subject deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Subject not found',
  })
  @ApiBadRequestResponse({
    description: 'Subject has active teaching assignments',
  })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.subjectsService.remove(id);
  }
}
