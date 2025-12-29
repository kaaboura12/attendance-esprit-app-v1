import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Classrooms Module
 * Handles classroom management functionality
 */
@Module({
  imports: [PrismaModule],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
