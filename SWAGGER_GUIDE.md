# 📚 Swagger API Documentation Guide

## 🎯 Overview

Professional Swagger/OpenAPI documentation has been implemented for the ESPRIT Attendance System API with interactive testing capabilities.

## 🚀 Accessing Swagger UI

### Local Development
Once the server is running, access Swagger at:
```
http://localhost:3000/api/docs
```

### Features
- 🔍 **Interactive API Explorer** - Test all endpoints directly from the browser
- 🔐 **Built-in Authentication** - Authorize once, test all protected endpoints
- 📝 **Request/Response Examples** - See real data examples
- ✅ **Input Validation** - Test with different inputs and see validation errors
- 📊 **Schema Documentation** - View all DTOs and their properties
- 🎨 **Beautiful UI** - Clean, professional interface

## 🔐 How to Test Authentication

### Step 1: Start the Server
```bash
cd attendance-backend
npm run start:dev
```

### Step 2: Open Swagger UI
Navigate to: `http://localhost:3000/api/docs`

### Step 3: Register a New User

1. Find the **Authentication** section
2. Click on `POST /api/auth/register`
3. Click **"Try it out"**
4. Modify the request body:

```json
{
  "email": "teacher@esprit.tn",
  "password": "Teacher@123",
  "role": "TEACHER",
  "fullName": "Dr. Mohamed Salah"
}
```

5. Click **"Execute"**
6. Copy the `accessToken` from the response

### Step 4: Authorize in Swagger

1. Click the 🔓 **"Authorize"** button at the top right
2. Enter: `Bearer YOUR_ACCESS_TOKEN_HERE`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 5: Test Protected Endpoints

Now you can test any protected endpoint:

1. Click on `GET /api/auth/profile`
2. Click **"Try it out"**
3. Click **"Execute"**
4. See your profile data!

## 📋 API Sections

### 1. Authentication
All authentication-related endpoints:
- `POST /register` - Create new user
- `POST /login` - Login user
- `GET /profile` - Get detailed profile
- `GET /me` - Get current user
- `POST /refresh` - Refresh token
- `GET /admin-test` - Admin only (requires ADMIN role)
- `GET /teacher-test` - Teacher/Admin (requires TEACHER or ADMIN)
- `GET /health` - Health check

### 2. Students (Coming Soon)
Student management endpoints

### 3. Teachers (Coming Soon)
Teacher management endpoints

### 4. Classrooms (Coming Soon)
Classroom management endpoints

### 5. Subjects (Coming Soon)
Subject management endpoints

### 6. Teaching Assignments (Coming Soon)
Teaching assignment management

### 7. IoT Devices (Coming Soon)
Device management endpoints

### 8. Sessions (Coming Soon)
Session management endpoints

### 9. Attendance (Coming Soon)
Attendance tracking endpoints

## 🎨 Swagger Features Implemented

### Request/Response Documentation
Every endpoint includes:
- ✅ Operation summary and description
- ✅ Request body examples
- ✅ Response examples for all status codes
- ✅ Error response examples
- ✅ Parameter descriptions

### Authentication Documentation
- ✅ Bearer token authentication setup
- ✅ Clear instructions on how to authenticate
- ✅ Persistent authorization (stays logged in during session)

### Data Validation Examples
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Enum values (roles)
- ✅ Required vs optional fields
- ✅ UUID validation

### Status Code Documentation
- ✅ 200 OK - Success
- ✅ 201 Created - Resource created
- ✅ 400 Bad Request - Validation errors
- ✅ 401 Unauthorized - Not authenticated
- ✅ 403 Forbidden - No permission
- ✅ 409 Conflict - Duplicate resource

## 🧪 Testing Scenarios

### Scenario 1: Register Student

```json
POST /api/auth/register

{
  "email": "student@esprit.tn",
  "password": "Student@123",
  "role": "STUDENT",
  "fullName": "Ahmed Ben Ali",
  "studentCode": "ESP202401",
  "classroomId": "your-classroom-uuid-here"
}
```

**Expected Response:** 201 Created with access token

### Scenario 2: Register Teacher

```json
POST /api/auth/register

{
  "email": "teacher@esprit.tn",
  "password": "Teacher@123",
  "role": "TEACHER",
  "fullName": "Dr. Mohamed Salah"
}
```

**Expected Response:** 201 Created with access token

### Scenario 3: Login

```json
POST /api/auth/login

{
  "email": "student@esprit.tn",
  "password": "Student@123"
}
```

**Expected Response:** 200 OK with access token

### Scenario 4: Get Profile (Protected)

```
GET /api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:** 200 OK with detailed profile

### Scenario 5: Test Role-Based Access

```
GET /api/auth/admin-test
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
- Admin user: 200 OK
- Non-admin user: 403 Forbidden

## 🎯 Testing Different Roles

### As a Student
1. Register with role: "STUDENT"
2. Include `studentCode` and `classroomId`
3. Login and get token
4. Test student-specific endpoints

### As a Teacher
1. Register with role: "TEACHER"
2. Include `fullName`
3. Login and get token
4. Test teacher endpoints (e.g., `/api/auth/teacher-test`)

### As an Admin
1. Register with role: "ADMIN"
2. Login and get token
3. Test admin-only endpoints (e.g., `/api/auth/admin-test`)

## ⚠️ Common Issues

### Issue: "Authorize" button shows lock icon 🔒
**Solution:** You're already authorized! The lock icon means authentication is active.

### Issue: 401 Unauthorized on protected endpoints
**Solution:** 
1. Make sure you clicked "Authorize" at the top
2. Check that you included "Bearer " before the token
3. Verify your token hasn't expired (default: 24h)

### Issue: 403 Forbidden
**Solution:** Your user doesn't have the required role for this endpoint. Check the endpoint's required roles.

### Issue: 400 Bad Request - Validation errors
**Solution:** Check the error message. Common issues:
- Invalid email format
- Weak password (must meet requirements)
- Missing required fields
- Wrong data types

## 🔧 Customization

### Swagger Configuration
Edit `src/config/swagger.config.ts` to customize:
- API title and description
- Contact information
- Servers (development, staging, production)
- Tags and grouping
- UI theme and styling

### DTO Documentation
Edit DTOs in `src/auth/dto/` to add:
- More detailed descriptions
- Additional examples
- Custom validation messages

### Controller Documentation
Edit controllers to add:
- More response examples
- Additional status codes
- Detailed descriptions

## 📊 Swagger Configuration Details

### Security Scheme
```typescript
.addBearerAuth({
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  name: 'Authorization',
  in: 'header',
})
```

### Custom Options
- Persistent authorization (stays logged in)
- Collapsed sections by default
- Search/filter enabled
- Request duration display
- Syntax highlighting
- Try-it-out enabled

## 🎉 Benefits

1. **No Postman Needed** - Test everything in the browser
2. **Self-Documenting** - API documentation always up-to-date
3. **Easy Onboarding** - New developers can understand API quickly
4. **Interactive Testing** - Test edge cases easily
5. **Production Ready** - Can be deployed with the app

## 📚 Additional Resources

- [Swagger Official Docs](https://swagger.io/docs/)
- [NestJS Swagger Plugin](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)

## 🚀 Next Steps

1. ✅ Test all authentication endpoints in Swagger
2. 🔄 Add Swagger documentation to other modules (students, teachers, etc.)
3. 🔄 Document all response schemas
4. 🔄 Add more request examples
5. 🔄 Document error codes comprehensively

---

**Swagger is ready! Start testing at: `http://localhost:3000/api/docs` 🎉**

