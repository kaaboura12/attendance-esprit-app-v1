import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Subjects Module
 * Handles subject/course management functionality
 */
@Module({
  imports: [PrismaModule],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
