# 🚀 Quick Start Guide - ESPRIT Attendance Authentication

## ✅ What's Been Implemented

### 📁 File Structure
```
src/
├── auth/
│   ├── decorators/
│   │   ├── public.decorator.ts          # @Public() - Make routes public
│   │   ├── roles.decorator.ts           # @Roles() - Restrict by role
│   │   ├── current-user.decorator.ts    # @CurrentUser() - Get user from JWT
│   │   └── index.ts
│   ├── dto/
│   │   ├── login.dto.ts                 # Login validation
│   │   ├── register.dto.ts              # Registration validation
│   │   ├── auth-response.dto.ts         # API response format
│   │   └── index.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts            # JWT authentication
│   │   ├── local-auth.guard.ts          # Login authentication
│   │   ├── roles.guard.ts               # Role-based authorization
│   │   └── index.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts              # JWT validation strategy
│   │   ├── local.strategy.ts            # Login validation strategy
│   │   └── index.ts
│   ├── auth.controller.ts               # API endpoints
│   ├── auth.service.ts                  # Business logic
│   └── auth.module.ts                   # Module configuration
├── prisma/
│   ├── prisma.service.ts                # Database connection
│   └── prisma.module.ts                 # Global database module
├── app.module.ts                        # Root module (updated)
└── main.ts                              # App bootstrap (updated)
```

## 🎯 Features Implemented

✅ **User Registration** with role-based profile creation
✅ **User Login** with JWT token generation
✅ **Password Security** using bcrypt (10 rounds)
✅ **JWT Authentication** with configurable expiration
✅ **Role-Based Access Control** (STUDENT, TEACHER, ADMIN)
✅ **Global Authentication** (all routes protected by default)
✅ **Custom Decorators** for easy authorization
✅ **Input Validation** with class-validator
✅ **Transaction Support** for atomic operations
✅ **Error Handling** with meaningful messages
✅ **Prisma Integration** with PostgreSQL/Supabase
✅ **CORS Configuration** for frontend integration
✅ **Global Validation Pipe**

## 🏃 Running the Application

### 1. Generate Prisma Client (if not done)
```bash
cd attendance-backend
npx prisma generate
```

### 2. Push Database Schema
```bash
npx prisma db push
```

### 3. Start Development Server
```bash
npm run start:dev
```

The server will start at: `http://localhost:3000/api`

### 4. Health Check
```bash
curl http://localhost:3000/api/auth/health
```

## 🧪 Testing Authentication

### Step 1: Create a Classroom (Required for Student Registration)

First, you need to create a classroom. You can do this via Prisma Studio or API:

```bash
# Open Prisma Studio
npx prisma studio
```

Create a classroom with:
- name: "GL2-A"
- level: 2
- department: "GL"

### Step 2: Register a Student

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@esprit.tn",
    "password": "Student@123",
    "role": "STUDENT",
    "fullName": "Ahmed Ben Ali",
    "studentCode": "ESP202401",
    "classroomId": "YOUR_CLASSROOM_UUID_HERE"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@esprit.tn",
    "role": "STUDENT",
    "createdAt": "2025-12-29T..."
  }
}
```

### Step 3: Register a Teacher

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@esprit.tn",
    "password": "Teacher@123",
    "role": "TEACHER",
    "fullName": "Dr. Mohamed Salah"
  }'
```

### Step 4: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@esprit.tn",
    "password": "Student@123"
  }'
```

### Step 5: Access Protected Route

```bash
# Save the token from login/register response
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 🔐 Environment Variables

Your `.env` file has been configured with:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."

# JWT Configuration
JWT_SECRET=esprit-attendance-secret-key-[generated]
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

## 🎨 How to Use in Your Code

### Protect a Route (Already Protected by Default)
```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './auth/decorators';

@Controller('students')
export class StudentsController {
  @Get('my-attendance')
  getMyAttendance(@CurrentUser() user: any) {
    // user is automatically injected from JWT
    return `Attendance for student ${user.id}`;
  }
}
```

### Make a Route Public
```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators';

@Controller('public')
export class PublicController {
  @Public()
  @Get('info')
  getInfo() {
    return 'This is accessible without authentication';
  }
}
```

### Restrict by Role
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from './auth/decorators';
import { RolesGuard } from './auth/guards';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  adminDashboard() {
    return 'Admin only';
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('reports')
  getReports() {
    return 'Admin and Teachers only';
  }
}
```

### Extract Specific User Property
```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './auth/decorators';

@Controller('profile')
export class ProfileController {
  @Get('my-id')
  getMyId(@CurrentUser('id') userId: string) {
    return { userId };
  }

  @Get('my-email')
  getMyEmail(@CurrentUser('email') email: string) {
    return { email };
  }

  @Get('my-role')
  getMyRole(@CurrentUser('role') role: string) {
    return { role };
  }
}
```

## 🎯 User Roles

- **STUDENT**: Students with attendance tracking
- **TEACHER**: Teachers who manage sessions
- **ADMIN**: System administrators

## 📝 Password Rules

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

Examples:
- ✅ `Student@123`
- ✅ `MyP@ssw0rd`
- ✅ `Secure#Pass1`
- ❌ `password` (no uppercase, no number, no special char)
- ❌ `Pass123` (no special char)
- ❌ `SHORT1!` (less than 8 chars)

## 🐛 Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL in .env
- Ensure it has `?sslmode=require` at the end
- Verify your Supabase database is running

### "Classroom not found"
- Create a classroom first using Prisma Studio (`npx prisma studio`)
- Or create classrooms via API (implement classroom endpoints)

### "Invalid email or password"
- Check credentials are correct
- Ensure password meets requirements

### Server won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

## 📚 Additional Documentation

- See `AUTH_DOCUMENTATION.md` for comprehensive documentation
- See `README.md` for general project information
- See Prisma schema at `prisma/schema.prisma`

## 🎉 Next Steps

1. ✅ Authentication is complete and working
2. 🔄 Implement other modules (students, teachers, classrooms, etc.)
3. 🔄 Add attendance tracking logic
4. 🔄 Implement IoT device integration
5. 🔄 Build frontend integration
6. 🔄 Add real-time features (WebSockets)
7. 🔄 Add reporting and analytics

---

**All authentication functionality is production-ready! 🎯**

