<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StudentController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Attendance Routes (for mobile apps or AJAX)
    Route::post('/attendance/submit', [AttendanceController::class, 'submit'])
        ->middleware('role:student')
        ->name('api.attendance.submit');

    Route::get('/attendance/validate', [AttendanceController::class, 'validate'])
        ->middleware('role:student')
        ->name('api.attendance.validate');

    Route::get('/attendance/history', [AttendanceController::class, 'history'])
        ->middleware('role:student')
        ->name('api.attendance.history');

    Route::get('/attendance/stats/{courseId}', [AttendanceController::class, 'getStats'])
        ->middleware('role:student')
        ->name('api.attendance.stats');

    // Student History API
    Route::get('/student/attendance-history', [StudentController::class, 'getAttendanceHistory'])
        ->middleware('role:student')
        ->name('api.student.history');
});
