import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new subject
 */
export class CreateSubjectDto {
  @ApiProperty({
    description: 'Subject name',
    example: 'Flutter Development',
  })
  @IsString()
  @IsNotEmpty({ message: 'Subject name is required' })
  name: string;

  @ApiProperty({
    description: 'Subject code (unique identifier)',
    example: 'FLUT301',
  })
  @IsString()
  @IsNotEmpty({ message: 'Subject code is required' })
  code: string;
}

