<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/privacy', function () {
    return Inertia::render('Legal/Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Legal/Terms');
})->name('terms');

Route::get('/support', function () {
    return Inertia::render('Legal/Support');
})->name('support');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ============================================
// ADMIN ROUTES - Only admins can access
// ============================================
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])
        ->name('admin.dashboard');

    Route::get('/admin/users', [AdminController::class, 'listUsers'])
        ->name('admin.users');

    Route::get('/admin/courses', [AdminController::class, 'listCourses'])
        ->name('admin.courses');

    Route::post('/admin/courses', [AdminController::class, 'storeCourse'])
        ->name('admin.courses.store');

    Route::get('/admin/enrollments', [AdminController::class, 'listEnrollments'])
        ->name('admin.enrollments');

    Route::post('/admin/enrollments', [AdminController::class, 'storeEnrollment'])
        ->name('admin.enrollments.store');

    Route::patch('/admin/enrollments/{enrollment}/status', [AdminController::class, 'updateEnrollmentStatus'])
        ->name('admin.enrollments.status');
});

// ============================================
// TEACHER ROUTES - Only teachers can access
// ============================================
Route::middleware(['auth', 'verified', 'role:teacher'])->group(function () {
    Route::get('/teacher/dashboard', [TeacherController::class, 'dashboard'])
        ->name('teacher.dashboard');

    Route::get('/teacher/courses', [TeacherController::class, 'showCourses'])
        ->name('teacher.courses');

    Route::get('/courses/{course}/generate-qr', [TeacherController::class, 'showGenerateQR'])
        ->name('course.generate-qr');

    Route::post('/courses/{course}/qr', [TeacherController::class, 'generateQR'])
        ->name('course.qr.generate');

    Route::post('/courses/{course}/qr/refresh', [TeacherController::class, 'refreshQR'])
        ->name('course.qr.refresh');

    Route::post('/courses/{course}/qr/stop', [TeacherController::class, 'stopQR'])
        ->name('course.qr.stop');

    Route::get('/courses/{course}/attendance', [TeacherController::class, 'viewAttendance'])
        ->name('course.attendance');

    Route::get('/courses/{course}/attendance/export', [TeacherController::class, 'downloadReport'])
        ->name('course.attendance.export');
});

// ============================================
// STUDENT ROUTES - Only students can access
// ============================================
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/student/dashboard', [StudentController::class, 'dashboard'])
        ->name('student.dashboard');

    Route::get('/student/courses', [StudentController::class, 'showCourses'])
        ->name('student.courses');

    Route::get('/student/scanner', [StudentController::class, 'showScanner'])
        ->name('student.scanner');

    Route::get('/student/attendance-history', [StudentController::class, 'showAttendanceHistory'])
        ->name('student.history');
});

require __DIR__.'/auth.php';
