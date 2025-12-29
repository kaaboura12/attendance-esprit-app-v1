import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new classroom
 */
export class CreateClassroomDto {
  @ApiProperty({
    description: 'Classroom name (e.g., GL2-A, DS3-B)',
    example: 'GL2-A',
  })
  @IsString()
  @IsNotEmpty({ message: 'Classroom name is required' })
  name: string;

  @ApiProperty({
    description: 'Academic level (1-5)',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'Level must be an integer' })
  @Min(1, { message: 'Level must be at least 1' })
  @Max(5, { message: 'Level must not exceed 5' })
  level: number;

  @ApiProperty({
    description: 'Department code (e.g., GL, DS, AR)',
    example: 'GL',
  })
  @IsString()
  @IsNotEmpty({ message: 'Department is required' })
  department: string;
}

