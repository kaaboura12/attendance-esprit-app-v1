import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeachingAssignmentsModule } from './teaching-assignments/teaching-assignments.module';
import { DevicesModule } from './devices/devices.module';
import { SessionsModule } from './sessions/sessions.module';
import { AttendanceModule } from './attendance/attendance.module';

/**
 * Root Application Module
 * Imports all feature modules and configures global services
 */
@Module({
  imports: [
    // Configuration Module - loads .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global Prisma Module
    PrismaModule,
    // Feature Modules
    AuthModule,
    StudentsModule,
    TeachersModule,
    ClassroomsModule,
    SubjectsModule,
    TeachingAssignmentsModule,
    DevicesModule,
    SessionsModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
