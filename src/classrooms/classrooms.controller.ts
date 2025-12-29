import { Controller } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';

@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}
}
