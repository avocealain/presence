# QR-Based Attendance System - Complete Architecture Guide

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Data Models & Relationships](#data-models--relationships)
3. [Database Schema](#database-schema)
4. [Key Workflows](#key-workflows)
5. [Security & Validation](#security--validation)
6. [Implementation Checklist](#implementation-checklist)

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   USER INTERFACE (React)                    │
├─────────────────────────────────────────────────────────────┤
│  Teacher Dashboard    Student Scanner    Admin Analytics    │
│  Generate QR          Camera Input       Statistics          │
│  View Attendance      Scan History       User Management     │
└─────────────┬──────────────────────────┬────────────────────┘
              │ HTTP (Inertia/API)       │
              ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│              LARAVEL BACKEND - Controllers                  │
├─────────────────────────────────────────────────────────────┤
│  TeacherController    StudentController    AttendanceCtrl   │
│  - generateQR()       - showScanner()      - submit()       │
│  - viewAttendance()   - showHistory()      - validate()     │
│  - refreshQR()        - showCourses()      - history()      │
└─────────────┬──────────────────────────┬────────────────────┘
              │ Eloquent ORM             │
              ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│             MODELS & BUSINESS LOGIC                         │
├─────────────────────────────────────────────────────────────┤
│  Course         QRSession        AttendanceRecord           │
│  - teacher      - isValid()      - validate()              │
│  - enrollments  - isExpired()    - getDeviceInfo()         │
│  - attendance   - token          - duplicate check         │
└─────────────┬──────────────────────────┬────────────────────┘
              │ SQL Queries              │
              ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                           │
├─────────────────────────────────────────────────────────────┤
│  users  courses  enrollments  qr_sessions  attendance_records
│  audit_logs  sessions  password_reset_tokens               │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
TEACHER WORKFLOW:
1. Teacher POST /courses/{id}/qr
2. TeacherController::generateQR()
3. Create QRSession (token + 30s expiration)
4. Generate QR code image
5. Return Inertia response with QR code
6. Frontend displays QR with auto-refresh

STUDENT WORKFLOW:
1. Student loads /student/scanner
2. Camera permission requested
3. Scan QR code → Extract token
4. POST /api/attendance/submit {token}
5. AttendanceController::submit()
6. Validate QR token, enrollment, no duplicates
7. Create AttendanceRecord
8. Log to AuditLog
9. Return success/error response
```

---

## Data Models & Relationships

### ER Diagram

```
users (extended)
├─ id (PK)
├─ name
├─ email
├─ password
├─ role: admin|teacher|student
├─ department
├─ is_active
└─ timestamps

        ▲
        │ teacher_id (FK)
        │
courses ◄─────┐
├─ id (PK)    │
├─ code       │
├─ name       ├─ Relationships
├─ semester   │
└─ created_at │

        ▼
course_enrollments
├─ id (PK)
├─ course_id (FK) ──┐
├─ student_id (FK)──┤ Relates to users
├─ enrolled_at      │
└─ status          │

        ▼
qr_sessions
├─ id (PK)
├─ course_id (FK) ──┐
├─ token (UNIQUE)   ├─ Unique QR instance
├─ expires_at       │
├─ is_active        │
└─ attendance_count │

        ▼
attendance_records
├─ id (PK)
├─ qr_session_id (FK) ──┐
├─ student_id (FK)      ├─ One entry per scan
├─ course_id (FK)       │
├─ marked_at (UNIQUE)   │
└─ ip_address          │

        └──────────────────┘
             (UNIQUE)
         Prevents duplicates
```

### Model Relationships Code

```php
// User Model
class User {
    // Teacher perspective
    public function courses() { // Teacher's courses
        return $this->hasMany(Course::class, 'teacher_id');
    }
    
    // Student perspective
    public function enrollments() { // Courses enrolled in
        return $this->hasMany(CourseEnrollment::class, 'student_id');
    }
    
    public function attendanceRecords() {
        return $this->hasMany(AttendanceRecord::class, 'student_id');
    }
    
    public function auditLogs() {
        return $this->hasMany(AuditLog::class);
    }
}

// Course Model
class Course {
    public function teacher() {
        return $this->belongsTo(User::class, 'teacher_id');
    }
    
    public function enrollments() {
        return $this->hasMany(CourseEnrollment::class);
    }
    
    public function students() { // Through enrollments
        return $this->hasManyThrough(
            User::class,
            CourseEnrollment::class,
            'course_id',
            'id',
            'id',
            'student_id'
        );
    }
    
    public function qrSessions() {
        return $this->hasMany(QRSession::class);
    }
    
    public function attendanceRecords() {
        return $this->hasMany(AttendanceRecord::class);
    }
}

// CourseEnrollment Model
class CourseEnrollment {
    public function course() {
        return $this->belongsTo(Course::class);
    }
    
    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }
    
    public function attendanceRecords() {
        return $this->hasMany(AttendanceRecord::class, 'enrollment_id');
    }
}

// QRSession Model
class QRSession {
    public function course() {
        return $this->belongsTo(Course::class);
    }
    
    public function attendanceRecords() {
        return $this->hasMany(AttendanceRecord::class);
    }
    
    public function isValid() {
        return $this->is_active && !$this->isExpired();
    }
    
    public function isExpired() {
        return now()->gt($this->expires_at);
    }
}

// AttendanceRecord Model
class AttendanceRecord {
    public function qrSession() {
        return $this->belongsTo(QRSession::class);
    }
    
    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }
    
    public function course() {
        return $this->belongsTo(Course::class);
    }
    
    public function enrollment() {
        return $this->belongsTo(CourseEnrollment::class);
    }
}
```

---

## Database Schema

### Complete SQL Schema

```sql
-- 1. EXTEND USERS TABLE
ALTER TABLE users ADD COLUMN role ENUM('admin', 'teacher', 'student') 
    DEFAULT 'student' AFTER password;
ALTER TABLE users ADD COLUMN department VARCHAR(255) NULLABLE AFTER role;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true AFTER department;

-- 2. COURSES TABLE
CREATE TABLE courses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Course code (e.g., CS101)',
    name VARCHAR(255) NOT NULL COMMENT 'Course name',
    description TEXT COMMENT 'Course description',
    semester INT COMMENT 'Semester number (1,2,3...)',
    academic_year VARCHAR(10) COMMENT 'Academic year (e.g., 2024-2025)',
    max_students INT DEFAULT 50,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_code (code)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. COURSE ENROLLMENTS TABLE
CREATE TABLE course_enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'dropped', 'completed') DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_enrollment (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. QR SESSIONS TABLE (Time-limited QR instances)
CREATE TABLE qr_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL COMMENT 'Unique token for QR code',
    qr_code_path VARCHAR(255) COMMENT 'Path to generated QR image',
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    attendance_count INT DEFAULT 0,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_course (course_id),
    INDEX idx_token (token),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ATTENDANCE RECORDS TABLE
CREATE TABLE attendance_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    qr_session_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    marked_at TIMESTAMP COMMENT 'When attendance was marked',
    ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6 address',
    user_agent TEXT COMMENT 'Browser/device info',
    device_info JSON COMMENT 'Device details',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_attendance (qr_session_id, student_id),
    FOREIGN KEY (qr_session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    INDEX idx_course (course_id),
    INDEX idx_student (student_id),
    INDEX idx_marked_at (marked_at),
    INDEX idx_qr_session (qr_session_id)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED COMMENT 'User who performed action',
    action VARCHAR(255) NOT NULL COMMENT 'Action type (e.g., attendance_submitted)',
    entity_type VARCHAR(255) COMMENT 'Entity affected (e.g., AttendanceRecord)',
    entity_id BIGINT UNSIGNED,
    old_values JSON COMMENT 'Previous values',
    new_values JSON COMMENT 'New values',
    ip_address VARCHAR(45),
    created_at TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Key Workflows

### Workflow 1: Teacher Generates QR Code

```
┌─────────────────────────────────────────────────────────────┐
│ TEACHER GENERATES QR CODE (30-Second Session)             │
└─────────────────────────────────────────────────────────────┘

Step 1: Teacher clicks "Generate QR Code"
        POST /courses/{courseId}/qr

Step 2: TeacherController::generateQR()
        - Verify teacher owns course
        - Create QRSession:
          {
            token: unique_random_string,
            course_id: X,
            started_at: now(),
            expires_at: now() + 30 seconds,
            is_active: true,
            created_by: teacher_id
          }

Step 3: Generate QR Code
        - Encode token into QR image
        - Save image to storage/qr-codes/
        - Store path in QRSession.qr_code_path

Step 4: Return to Teacher
        - Pass QRSession to React component
        - Display QR image
        - Show countdown timer (30s)
        - Enable auto-refresh button

Step 5: Auto-Refresh (Client-Side)
        - JavaScript: setInterval(refreshQR, 25 seconds)
        - POST /courses/{courseId}/qr/refresh
        - Create new QRSession
        - Update QR image on screen

Step 6: QR Session Expires
        - expires_at timestamp passes
        - Teacher must click refresh to generate new QR
        - Student scans cannot be processed after expiry
```

### Workflow 2: Student Scans QR Code

```
┌─────────────────────────────────────────────────────────────┐
│ STUDENT SCANS QR CODE & MARKS ATTENDANCE                   │
└─────────────────────────────────────────────────────────────┘

Step 1: Student opens Scanner Page
        GET /student/scanner
        - Request camera permission
        - Show camera feed with QR detection overlay

Step 2: Student Scans Active QR Code
        - jsQR library detects QR pattern
        - Extract token from QR data
        - JavaScript sends to server

Step 3: Submit to Backend
        POST /api/attendance/submit
        {
          token: "extracted_from_qr",
          device_info: {
            userAgent: navigator.userAgent,
            timestamp: now()
          }
        }

Step 4: AttendanceController::submit()
        Validation Chain:
        
        a) Find QRSession by token
           if (!$qr = QRSession::where('token', $token)->first()) {
               return error('Invalid QR code');
           }
        
        b) Check if expired
           if ($qr->isExpired()) {
               return error('QR code expired');
           }
        
        c) Check if active
           if (!$qr->is_active) {
               return error('QR code no longer active');
           }
        
        d) Get student enrollment
           $enrollment = CourseEnrollment::where([
               'course_id' => $qr->course_id,
               'student_id' => auth()->id()
           ])->first();
           
           if (!$enrollment || $enrollment->status !== 'active') {
               return error('Not enrolled in this course');
           }
        
        e) Check for duplicate (UNIQUE constraint)
           if (AttendanceRecord::where([
               'qr_session_id' => $qr->id,
               'student_id' => auth()->id()
           ])->exists()) {
               return error('Already marked present');
           }

Step 5: Create Attendance Record
        $record = AttendanceRecord::create([
            'qr_session_id' => $qr->id,
            'course_id' => $qr->course_id,
            'enrollment_id' => $enrollment->id,
            'student_id' => auth()->id(),
            'marked_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'device_info' => $deviceInfo
        ]);
        
        $qr->increment('attendance_count');

Step 6: Log Action
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'attendance_marked',
            'entity_type' => 'AttendanceRecord',
            'entity_id' => $record->id,
            'ip_address' => request()->ip(),
            'new_values' => $record->toJson()
        ]);

Step 7: Return Success
        {
            success: true,
            message: 'Attendance marked successfully',
            course: 'CS101',
            timestamp: '2026-04-25 14:35:42'
        }

Step 8: Student Sees Confirmation
        - Success message displayed
        - Record added to attendance history
        - Can scan another course
```

### Workflow 3: Teacher Views Attendance

```
┌─────────────────────────────────────────────────────────────┐
│ TEACHER VIEWS LIVE ATTENDANCE REPORT                        │
└─────────────────────────────────────────────────────────────┘

Step 1: Teacher clicks "View Attendance"
        GET /courses/{courseId}/attendance

Step 2: TeacherController::viewAttendance()
        - Verify teacher owns course
        - Query Course with enrollments
        - Get latest QRSession
        - Count attendance records

Step 3: Fetch Attendance Data
        $course = Course::with([
            'enrollments.student',
            'qrSessions' => fn($q) => $q->latest(),
            'attendanceRecords' => fn($q) => $q->latest()
        ])->findOrFail($courseId);
        
        $stats = [
            'total_students' => $course->enrollments->count(),
            'present_today' => $course->attendanceRecords()
                ->whereDate('marked_at', today())
                ->count(),
            'attendance_rate' => (present / total) * 100
        ];

Step 4: Return Inertia Response
        return Inertia::render('Teacher/Attendance', [
            'course' => $course,
            'attendanceRecords' => $records,
            'stats' => $stats
        ]);

Step 5: Frontend Displays
        - Course name and code
        - Total/present/absent counts
        - Attendance percentage
        - List of students with attendance status
        - Export button (CSV/PDF)
```

---

## Security & Validation

### Security Layers

#### Layer 1: Authentication
```php
// User must be logged in
Route::middleware('auth')->group(function () {
    // All routes here require login
});

// Verified user only
Route::middleware('auth', 'verified')->group(function () {
    // User must have verified email
});
```

#### Layer 2: Authorization (Role-Based)
```php
// Custom middleware checks role
Route::middleware('auth', 'role:teacher')->group(function () {
    // Only teachers can access
    Route::post('/courses/{course}/qr', [TeacherController::class, 'generateQR']);
});

Route::middleware('auth', 'role:student')->group(function () {
    // Only students can access
    Route::post('/api/attendance/submit', [AttendanceController::class, 'submit']);
});
```

#### Layer 3: Ownership Verification
```php
// In TeacherController::generateQR($course)
$course = Course::findOrFail($id);

// Verify logged-in teacher owns this course
if ($course->teacher_id !== auth()->id()) {
    abort(403, 'Unauthorized');
}

// Proceed with QR generation
```

#### Layer 4: Enrollment Verification
```php
// In AttendanceController::submit()
$enrollment = CourseEnrollment::where([
    'course_id' => $qr->course_id,
    'student_id' => auth()->id(),
    'status' => 'active'
])->firstOrFail();

// Prevents students from marking attendance for unenrolled courses
```

#### Layer 5: Time Validation
```php
// QRSession must not be expired
public function validate(QRSession $qr)
{
    if (now()->gt($qr->expires_at)) {
        throw new ValidationException('QR code expired');
    }
    
    return true;
}
```

#### Layer 6: Duplicate Prevention
```sql
-- Database level: UNIQUE constraint
UNIQUE KEY unique_attendance (qr_session_id, student_id)

-- Application level: Check before insert
if (AttendanceRecord::where([
    'qr_session_id' => $qr->id,
    'student_id' => auth()->id()
])->exists()) {
    throw new ValidationException('Already marked present');
}
```

### Validation Sequence Diagram

```
Student submits QR token
    │
    ▼
Auth middleware: Is user logged in?
    ├─ NO  → Return 401 Unauthorized
    │
    ▼
Role middleware: Is user a student?
    ├─ NO  → Return 403 Forbidden
    │
    ▼
Find QRSession by token
    ├─ NOT FOUND  → Return 'Invalid QR code'
    │
    ▼
Check: QRSession.is_active = true
    ├─ FALSE  → Return 'QR code not active'
    │
    ▼
Check: NOW() < QRSession.expires_at
    ├─ FALSE  → Return 'QR code expired'
    │
    ▼
Find CourseEnrollment
    ├─ NOT FOUND  → Return 'Not enrolled in course'
    ├─ Status != 'active'  → Return 'Enrollment not active'
    │
    ▼
Check for duplicate (UNIQUE constraint)
    ├─ EXISTS  → Return 'Already marked present'
    │
    ▼
✅ ALL CHECKS PASS
    │
    ▼
Create AttendanceRecord
Log to AuditLog
Return Success
```

---

## Implementation Checklist

### ✅ Phase 1: Database & Models (Priority: HIGH)
- [ ] Create migration: Extend users table (role, department, is_active)
- [ ] Create migration: courses table
- [ ] Create migration: course_enrollments table
- [ ] Create migration: qr_sessions table
- [ ] Create migration: attendance_records table
- [ ] Create migration: audit_logs table
- [ ] Run migrations: `php artisan migrate`
- [ ] Create User model extension (add relationships)
- [ ] Create Course model
- [ ] Create CourseEnrollment model
- [ ] Create QRSession model
- [ ] Create AttendanceRecord model
- [ ] Create AuditLog model
- [ ] Test relationships: `php artisan tinker`

### ✅ Phase 2: Controllers & Routes (Priority: HIGH)
- [ ] Create TeacherController with methods
- [ ] Create StudentController with methods
- [ ] Create AttendanceController (API) with methods
- [ ] Create CourseController with CRUD operations
- [ ] Create CheckRole middleware
- [ ] Register middleware in Kernel.php
- [ ] Update routes/web.php with teacher/student/admin routes
- [ ] Update routes/api.php with API endpoints
- [ ] Test routes: `php artisan route:list`

### ✅ Phase 3: Business Logic (Priority: HIGH)
- [ ] Implement QR code generation (use `endroid/qr-code` package)
- [ ] Implement QR validation in AttendanceController
- [ ] Implement duplicate prevention logic
- [ ] Implement time expiration logic
- [ ] Implement audit logging
- [ ] Implement enrollment verification
- [ ] Add error handling and exceptions

### ✅ Phase 4: Frontend Pages (Priority: MEDIUM)
- [ ] Create TeacherDashboard.jsx
- [ ] Create GenerateQR.jsx (with auto-refresh)
- [ ] Create ViewAttendance.jsx
- [ ] Create StudentDashboard.jsx
- [ ] Create Scanner.jsx (with camera & jsQR)
- [ ] Create AttendanceHistory.jsx
- [ ] Add navigation to sidebar
- [ ] Test all pages with different user roles

### ✅ Phase 5: Testing (Priority: MEDIUM)
- [ ] Write tests for QR validation
- [ ] Write tests for duplicate prevention
- [ ] Write tests for role-based access
- [ ] Write tests for enrollment verification
- [ ] Write tests for time expiration
- [ ] Run test suite: `php artisan test`

### ✅ Phase 6: Polish & Deploy (Priority: LOW)
- [ ] Add error handling pages
- [ ] Add loading states
- [ ] Add success notifications
- [ ] Optimize queries (eager loading)
- [ ] Add database indexing
- [ ] Document API endpoints
- [ ] Security audit
- [ ] Deploy to production

---

## Quick Reference

### Key Files to Create

```
database/migrations/
├── 2026_04_25_000001_extend_users_table.php
├── 2026_04_25_000002_create_courses_table.php
├── 2026_04_25_000003_create_course_enrollments_table.php
├── 2026_04_25_000004_create_qr_sessions_table.php
├── 2026_04_25_000005_create_attendance_records_table.php
└── 2026_04_25_000006_create_audit_logs_table.php

app/Models/
├── Course.php
├── CourseEnrollment.php
├── QRSession.php
├── AttendanceRecord.php
└── AuditLog.php

app/Http/Controllers/
├── TeacherController.php
├── StudentController.php
├── AttendanceController.php
└── CourseController.php

app/Http/Middleware/
└── CheckRole.php

resources/js/Pages/
├── Teacher/GenerateQR.jsx
├── Teacher/Attendance.jsx
├── Student/Scanner.jsx
└── Student/History.jsx
```

### Environment Variables

```env
QR_VALIDITY_SECONDS=30
QR_CODE_SIZE=300
QR_ERROR_CORRECTION=H
AUDIT_LOG_ENABLED=true
```

### Common Queries

```php
// Get all students in a course
$students = Course::find($courseId)->students;

// Get today's attendance for a course
$attendance = AttendanceRecord::where('course_id', $courseId)
    ->whereDate('marked_at', today())
    ->get();

// Get attendance rate for a student
$attended = AttendanceRecord::where('student_id', $studentId)->count();
$total = QRSession::where('course_id', $courseId)->count();
$rate = ($attended / $total) * 100;

// Get all active QR sessions
$activeSessions = QRSession::where('is_active', true)
    ->where('expires_at', '>', now())
    ->get();
```

---

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Status:** Ready for Implementation
