# ✅ Swagger Testing Checklist

Use this checklist to systematically test all authentication endpoints in Swagger UI.

## 🚀 Setup

- [ ] Server is running (`npm run start:dev`)
- [ ] Swagger UI opened at `http://localhost:3000/api/docs`
- [ ] Swagger page loads successfully
- [ ] All endpoints are visible

## 📋 Public Endpoints (No Authentication)

### Health Check
- [ ] `GET /api/auth/health`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 200 OK
  - [ ] Body contains: `{ status: "ok", service: "authentication", timestamp: "..." }`

### Register Teacher
- [ ] `POST /api/auth/register`
  - [ ] Click "Try it out"
  - [ ] Use request body:
    ```json
    {
      "email": "teacher@esprit.tn",
      "password": "Teacher@123",
      "role": "TEACHER",
      "fullName": "Dr. Mohamed Salah"
    }
    ```
  - [ ] Click "Execute"
  - [ ] Response: 201 Created
  - [ ] Body contains `accessToken` and `user` object
  - [ ] **Copy the accessToken for later**

### Register Student (Requires Classroom)
- [ ] Create a classroom first (via Prisma Studio or API)
- [ ] Note the classroom UUID
- [ ] `POST /api/auth/register`
  - [ ] Click "Try it out"
  - [ ] Use request body:
    ```json
    {
      "email": "student@esprit.tn",
      "password": "Student@123",
      "role": "STUDENT",
      "fullName": "Ahmed Ben Ali",
      "studentCode": "ESP202401",
      "classroomId": "YOUR_CLASSROOM_UUID"
    }
    ```
  - [ ] Click "Execute"
  - [ ] Response: 201 Created
  - [ ] Body contains `accessToken` and `user` object

### Register Admin
- [ ] `POST /api/auth/register`
  - [ ] Click "Try it out"
  - [ ] Use request body:
    ```json
    {
      "email": "admin@esprit.tn",
      "password": "Admin@123",
      "role": "ADMIN",
      "fullName": "System Administrator"
    }
    ```
  - [ ] Click "Execute"
  - [ ] Response: 201 Created
  - [ ] Body contains `accessToken` and `user` object

### Login
- [ ] `POST /api/auth/login`
  - [ ] Click "Try it out"
  - [ ] Use credentials from previous registration:
    ```json
    {
      "email": "teacher@esprit.tn",
      "password": "Teacher@123"
    }
    ```
  - [ ] Click "Execute"
  - [ ] Response: 200 OK
  - [ ] Body contains `accessToken` and `user` object

## 🔐 Authorization Setup

- [ ] Click the 🔓 **"Authorize"** button at the top right
- [ ] Enter: `Bearer YOUR_ACCESS_TOKEN` (paste the token from registration/login)
- [ ] Click "Authorize"
- [ ] Button changes to 🔒 (locked icon)
- [ ] Click "Close"

## 🔒 Protected Endpoints (Requires Authentication)

### Get Profile
- [ ] `GET /api/auth/profile`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 200 OK
  - [ ] Body contains detailed user profile with role-specific data
  - [ ] Student profile includes classroom information
  - [ ] Teacher profile includes teacher information

### Get Current User
- [ ] `GET /api/auth/me`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 200 OK
  - [ ] Body contains basic user information

### Refresh Token
- [ ] `POST /api/auth/refresh`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 200 OK
  - [ ] Body contains new `accessToken`

## 👥 Role-Based Endpoints

### Teacher/Admin Test (As Teacher)
- [ ] Authorize with TEACHER token
- [ ] `GET /api/auth/teacher-test`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 200 OK
  - [ ] Body contains success message

### Teacher/Admin Test (As Student)
- [ ] Authorize with STUDENT token
- [ ] `GET /api/auth/teacher-test`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 403 Forbidden

### Admin Only (As Admin)
- [ ] Authorize with ADMIN token
- [ ] `GET /api/auth/admin-test`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 200 OK
  - [ ] Body contains success message

### Admin Only (As Non-Admin)
- [ ] Authorize with TEACHER or STUDENT token
- [ ] `GET /api/auth/admin-test`
  - [ ] Click "Try it out"
  - [ ] Click "Execute"
  - [ ] Response: 403 Forbidden

## 🚫 Error Scenarios

### Validation Errors

#### Weak Password
- [ ] `POST /api/auth/register`
  - [ ] Use password: `"weak"`
  - [ ] Response: 400 Bad Request
  - [ ] Error message mentions password requirements

#### Invalid Email
- [ ] `POST /api/auth/register`
  - [ ] Use email: `"notanemail"`
  - [ ] Response: 400 Bad Request
  - [ ] Error message: "Please provide a valid email address"

#### Missing Required Field
- [ ] `POST /api/auth/register`
  - [ ] Remove `fullName` from body
  - [ ] Response: 400 Bad Request
  - [ ] Error message mentions missing field

#### Student Without Classroom
- [ ] `POST /api/auth/register`
  - [ ] Use role: "STUDENT"
  - [ ] Don't include `classroomId`
  - [ ] Response: 400 Bad Request
  - [ ] Error message: "Classroom ID is required for student registration"

### Authentication Errors

#### Invalid Credentials
- [ ] `POST /api/auth/login`
  - [ ] Use wrong password
  - [ ] Response: 401 Unauthorized
  - [ ] Error message: "Invalid email or password"

#### Duplicate Email
- [ ] `POST /api/auth/register`
  - [ ] Use email that already exists
  - [ ] Response: 409 Conflict
  - [ ] Error message: "User with this email already exists"

#### No Authentication Token
- [ ] Click "Authorize" and logout (remove token)
- [ ] Try any protected endpoint
- [ ] Response: 401 Unauthorized

#### Expired Token (Optional - requires waiting 24h)
- [ ] Use a token that's older than 24 hours
- [ ] Try any protected endpoint
- [ ] Response: 401 Unauthorized

## 🎨 UI/UX Checks

- [ ] All sections are collapsible
- [ ] Search/filter works
- [ ] Examples are visible and formatted
- [ ] Response duration is displayed
- [ ] Syntax highlighting works
- [ ] Schema definitions are viewable
- [ ] Request/Response tabs work
- [ ] "Try it out" / "Cancel" toggles work

## 📚 Documentation Checks

- [ ] API title displays correctly
- [ ] Description is visible and formatted
- [ ] Version number shows
- [ ] All tags are visible (Authentication, Students, etc.)
- [ ] Each endpoint has:
  - [ ] Summary
  - [ ] Description
  - [ ] Request body example
  - [ ] Response examples
  - [ ] Status code documentation

## ✅ Final Checks

- [ ] All endpoints return expected responses
- [ ] Authentication flow works end-to-end
- [ ] Role-based access control works
- [ ] Error messages are clear and helpful
- [ ] Swagger persists authorization across page refreshes
- [ ] No console errors in browser
- [ ] No server errors in terminal

## 📊 Test Results

**Date:** _______________

**Tested By:** _______________

**Total Tests:** 40+

**Passed:** _____ / 40+

**Failed:** _____

**Notes:**
```
Write any issues or observations here
```

---

## 🎉 Success Criteria

All checkboxes should be checked (✅) for Swagger implementation to be considered complete and production-ready.

**Status:** 
- [ ] ✅ All tests passed
- [ ] ⚠️ Some tests failed (see notes)
- [ ] ❌ Major issues found

---

**Happy Testing! 🚀**

