import { Controller } from '@nestjs/common';
import { TeachingAssignmentsService } from './teaching-assignments.service';

@Controller('teaching-assignments')
export class TeachingAssignmentsController {
  constructor(private readonly teachingAssignmentsService: TeachingAssignmentsService) {}
}
