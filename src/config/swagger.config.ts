import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Swagger/OpenAPI Configuration
 * Configures and initializes Swagger documentation for the API
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('ESPRIT Attendance System API')
    .setDescription(
      `
# ESPRIT Attendance System - API Documentation

A comprehensive attendance management system for ESPRIT university with IoT device integration.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Student, Teacher, and Admin roles
- 📊 **Attendance Tracking** - Real-time attendance management
- 🔧 **IoT Integration** - Support for RFID/NFC devices
- 📚 **Teaching Assignments** - Manage teacher-subject-classroom relationships

## Authentication

This API uses **Bearer Token** authentication. To access protected endpoints:

1. Register or login to get an access token
2. Click the 🔓 **Authorize** button at the top
3. Enter: \`Bearer YOUR_TOKEN_HERE\`
4. Click **Authorize** and **Close**

All protected endpoints will now include your authentication token.

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

## User Roles

- **STUDENT** - Students with attendance tracking
- **TEACHER** - Teachers who manage sessions
- **ADMIN** - System administrators

## Getting Started

1. Register a new user with \`POST /api/auth/register\`
2. Login with \`POST /api/auth/login\` to get your JWT token
3. Use the token to access protected endpoints
    `,
    )
    .setVersion('1.0')
    .setContact(
      'ESPRIT Attendance Team',
      'https://esprit.tn',
      'support@esprit.tn',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Local Development Server')
    .addServer('https://api.esprit-attendance.com', 'Production Server')
    .addBearerAuth() // Uses default 'bearer' scheme name that matches @ApiBearerAuth() decorator
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Students', 'Student management endpoints')
    .addTag('Teachers', 'Teacher management endpoints')
    .addTag('Classrooms', 'Classroom management endpoints')
    .addTag('Subjects', 'Subject/Course management endpoints')
    .addTag('Teaching Assignments', 'Teacher-Subject-Classroom assignments')
    .addTag('IoT Devices', 'IoT device management for attendance scanning')
    .addTag('Sessions', 'Class session management')
    .addTag('Attendance', 'Attendance record management')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
    },
    customSiteTitle: 'ESPRIT Attendance API Docs',
    customfavIcon: 'https://esprit.tn/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #2c3e50; }
    `,
  });
}

