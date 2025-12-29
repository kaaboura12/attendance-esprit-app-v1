import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Teachers Module
 * Handles teacher management functionality
 */
@Module({
  imports: [PrismaModule],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
