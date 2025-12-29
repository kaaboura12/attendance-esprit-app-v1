# 🔐 ESPRIT Attendance System - Authentication Documentation

## Overview

Professional JWT-based authentication system built with NestJS, Passport, Prisma, and PostgreSQL. Implements role-based access control (RBAC) for students, teachers, and administrators.

## 🏗️ Architecture

The authentication system follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── auth/
│   ├── decorators/       # Custom decorators (@Public, @Roles, @CurrentUser)
│   ├── dto/              # Data Transfer Objects
│   ├── guards/           # Authorization guards
│   ├── strategies/       # Passport strategies (JWT, Local)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
└── prisma/
    ├── prisma.service.ts # Database service
    └── prisma.module.ts
```

## 🚀 Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control (RBAC)** - Student, Teacher, Admin roles
- ✅ **Password Hashing** - Bcrypt with 10 salt rounds
- ✅ **Global Guards** - JWT protection on all routes by default
- ✅ **Custom Decorators** - @Public(), @Roles(), @CurrentUser()
- ✅ **Validation** - Comprehensive DTO validation with class-validator
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Transaction Support** - Atomic user + profile creation
- ✅ **Clean Error Handling** - Meaningful error messages

## 📋 API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@esprit.tn",
  "password": "StrongP@ss123",
  "role": "STUDENT",
  "fullName": "John Doe",
  "studentCode": "ESP123456",    // Required for STUDENT role
  "classroomId": "uuid-here"     // Required for STUDENT role
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@esprit.tn",
    "role": "STUDENT",
    "createdAt": "2025-12-29T10:00:00.000Z"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@esprit.tn",
  "password": "StrongP@ss123"
}
```

**Response:** Same as register

#### 3. Health Check
```http
GET /api/auth/health
```

### Protected Endpoints (Require Authentication)

#### 4. Get Current User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "student@esprit.tn",
  "role": "STUDENT",
  "createdAt": "2025-12-29T10:00:00.000Z",
  "student": {
    "id": "uuid",
    "studentCode": "ESP123456",
    "fullName": "John Doe",
    "classroomId": "uuid",
    "classroom": {
      "id": "uuid",
      "name": "GL2-A",
      "level": 2,
      "department": "GL"
    }
  }
}
```

#### 5. Get Current User (Simple)
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

#### 6. Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <jwt-token>
```

### Role-Protected Endpoints

#### 7. Admin Only
```http
GET /api/auth/admin-test
Authorization: Bearer <jwt-token>
```
**Required Role:** ADMIN

#### 8. Teacher & Admin
```http
GET /api/auth/teacher-test
Authorization: Bearer <jwt-token>
```
**Required Roles:** TEACHER or ADMIN

## 🔑 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## 🛡️ Security Best Practices Implemented

### 1. Password Security
- Bcrypt hashing with 10 salt rounds
- Passwords never stored in plain text
- Passwords excluded from all API responses

### 2. JWT Configuration
- Configurable expiration time (default: 24h)
- Secret key stored in environment variables
- Token validation on every protected request

### 3. Input Validation
- DTO validation on all endpoints
- Whitelist mode (strips unknown properties)
- Type transformation enabled

### 4. Authorization
- Global JWT guard (opt-out with @Public())
- Role-based access control
- User context injection via decorators

## 🎯 Usage Examples

### Protecting a Route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards';
import { CurrentUser } from './auth/decorators';

@Controller('students')
export class StudentsController {
  // Protected route - requires authentication
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
```

### Role-Based Protection

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from './auth/guards';
import { Roles } from './auth/decorators';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  adminDashboard() {
    return { message: 'Admin dashboard' };
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('reports')
  getReports() {
    return { message: 'Reports accessible by admin and teachers' };
  }
}
```

### Public Route

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators';

@Controller('public')
export class PublicController {
  @Public()
  @Get('info')
  getPublicInfo() {
    return { message: 'This is public' };
  }
}
```

### Extract User Information

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './auth/decorators';

@Controller('profile')
export class ProfileController {
  // Get entire user object
  @Get('full')
  getFullProfile(@CurrentUser() user: any) {
    return user;
  }

  // Get only user ID
  @Get('id')
  getUserId(@CurrentUser('id') userId: string) {
    return { userId };
  }

  // Get only email
  @Get('email')
  getUserEmail(@CurrentUser('email') email: string) {
    return { email };
  }
}
```

## 🧪 Testing with cURL

### Register a Student
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@esprit.tn",
    "password": "StrongP@ss123",
    "role": "STUDENT",
    "fullName": "John Doe",
    "studentCode": "ESP123456",
    "classroomId": "your-classroom-uuid"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@esprit.tn",
    "password": "StrongP@ss123"
  }'
```

### Get Profile (with token)
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Testing with Postman

1. **Import Collection**: Create a new collection for ESPRIT Attendance API
2. **Set Base URL**: `http://localhost:3000/api`
3. **Create Environment Variable**: 
   - Variable: `jwt_token`
   - Initial Value: (empty)

4. **Register/Login Request**:
   - Add to Tests tab:
   ```javascript
   pm.test("Save JWT token", function() {
     var jsonData = pm.response.json();
     pm.environment.set("jwt_token", jsonData.accessToken);
   });
   ```

5. **Protected Requests**:
   - Authorization tab → Type: Bearer Token
   - Token: `{{jwt_token}}`

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### Generate Secure JWT Secret

```bash
# Generate a random 32-byte base64 secret
openssl rand -base64 32
```

## 📦 Dependencies

```json
{
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/config": "^3.x.x",
  "bcrypt": "^6.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x"
}
```

## 🐛 Common Issues & Solutions

### Issue: "User not found or token invalid"
**Solution:** Token expired or invalid. Login again to get a new token.

### Issue: "Password must contain..."
**Solution:** Ensure password meets all requirements (uppercase, lowercase, number, special char, 8+ chars).

### Issue: "Student code is required"
**Solution:** When registering as STUDENT, both `studentCode` and `classroomId` are required.

### Issue: "Classroom not found"
**Solution:** Ensure the classroom exists before registering a student. Create classroom first.

## 🚀 Next Steps

1. **Create Initial Data**: Use Prisma Studio or seeds to create classrooms
2. **Test Registration**: Register users with different roles
3. **Test Authorization**: Verify role-based access works correctly
4. **Integrate Frontend**: Use JWT tokens in your frontend application
5. **Add Refresh Tokens**: Implement refresh token rotation (optional)
6. **Add Password Reset**: Email-based password recovery (optional)
7. **Add 2FA**: Two-factor authentication (optional)

## 📚 Additional Resources

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/)
- [Prisma Docs](https://www.prisma.io/docs)

---

**Built with ❤️ for ESPRIT Attendance System**

