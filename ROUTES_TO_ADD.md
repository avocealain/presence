# Routes Configuration for QR Attendance System

## Add to routes/web.php

Add these route groups to `routes/web.php`:

```php
<?php

// Existing Breeze routes remain unchanged

// TEACHER ROUTES
Route::middleware(['auth', 'verified', 'role:teacher'])->group(function () {
    // Teacher Dashboard
    Route::get('/teacher/dashboard', [App\Http\Controllers\TeacherController::class, 'dashboard'])
        ->name('teacher.dashboard');

    // Course Management
    Route::get('/teacher/courses', [App\Http\Controllers\TeacherController::class, 'showCourses'])
        ->name('teacher.courses');

    // QR Code Generation
    Route::get('/courses/{course}/generate-qr', [App\Http\Controllers\TeacherController::class, 'showGenerateQR'])
        ->name('course.generate-qr');
    Route::post('/courses/{course}/qr', [App\Http\Controllers\TeacherController::class, 'generateQR'])
        ->name('course.qr.generate');
    Route::post('/courses/{course}/qr/refresh', [App\Http\Controllers\TeacherController::class, 'refreshQR'])
        ->name('course.qr.refresh');

    // Attendance Viewing
    Route::get('/courses/{course}/attendance', [App\Http\Controllers\TeacherController::class, 'viewAttendance'])
        ->name('course.attendance');
    Route::get('/courses/{course}/attendance/export', [App\Http\Controllers\TeacherController::class, 'downloadReport'])
        ->name('course.attendance.export');
});

// STUDENT ROUTES
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    // Student Dashboard
    Route::get('/student/dashboard', [App\Http\Controllers\StudentController::class, 'dashboard'])
        ->name('student.dashboard');

    // Student Courses
    Route::get('/student/courses', [App\Http\Controllers\StudentController::class, 'showCourses'])
        ->name('student.courses');

    // QR Scanner
    Route::get('/student/scanner', [App\Http\Controllers\StudentController::class, 'showScanner'])
        ->name('student.scanner');

    // Attendance History
    Route::get('/student/attendance-history', [App\Http\Controllers\StudentController::class, 'showAttendanceHistory'])
        ->name('student.history');
});

// ADMIN ROUTES (to be implemented)
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [App\Http\Controllers\AdminController::class, 'dashboard'])
        ->name('admin.dashboard');
});
?>
```

## Add to routes/api.php

Add these API routes to `routes/api.php`:

```php
<?php

Route::middleware(['auth:sanctum'])->group(function () {
    // Attendance Routes (for mobile apps or AJAX)
    Route::post('/attendance/submit', [App\Http\Controllers\AttendanceController::class, 'submit'])
        ->middleware('role:student')
        ->name('api.attendance.submit');

    Route::get('/attendance/validate', [App\Http\Controllers\AttendanceController::class, 'validate'])
        ->middleware('role:student')
        ->name('api.attendance.validate');

    Route::get('/attendance/history', [App\Http\Controllers\AttendanceController::class, 'history'])
        ->middleware('role:student')
        ->name('api.attendance.history');

    Route::get('/attendance/stats/{courseId}', [App\Http\Controllers\AttendanceController::class, 'getStats'])
        ->middleware('role:student')
        ->name('api.attendance.stats');

    // Student History API
    Route::get('/student/attendance-history', [App\Http\Controllers\StudentController::class, 'getAttendanceHistory'])
        ->middleware('role:student')
        ->name('api.student.history');
});
?>
```

## Register Middleware

Add to `app/Http/Kernel.php` in the `$routeMiddleware` array:

```php
protected $routeMiddleware = [
    // ... existing middleware ...
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

## Important Notes

1. **Authentication**: All routes require `auth` and `verified` middleware
2. **Authorization**: Role-based access control is enforced via the `role` middleware
3. **API Routes**: Separate API routes for mobile app support with token authentication
4. **Course Access**: The Course model binding automatically handles route model binding

## Route Naming Convention

- Teacher routes: `teacher.*`
- Student routes: `student.*`
- Course routes: `course.*`
- API routes: `api.*`

This makes it easy to generate URLs in controllers and views:
```php
route('teacher.dashboard')      // /teacher/dashboard
route('course.generate-qr', $course)  // /courses/{id}/generate-qr
route('student.scanner')        // /student/scanner
route('api.attendance.submit')   // /api/attendance/submit
```
