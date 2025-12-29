import { Module } from '@nestjs/common';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { TeachingAssignmentsController } from './teaching-assignments.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Teaching Assignments Module
 * Handles teacher-subject-classroom assignment relationships
 * Implements the core business rule: One teacher teaches one subject to one classroom
 */
@Module({
  imports: [PrismaModule],
  controllers: [TeachingAssignmentsController],
  providers: [TeachingAssignmentsService],
  exports: [TeachingAssignmentsService],
})
export class TeachingAssignmentsModule {}
