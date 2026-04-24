<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Course;
use App\Models\QRSession;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    /**
     * Show teacher dashboard.
     * GET /teacher/dashboard
     */
    public function dashboard(): Response
    {
        $courses = auth()->user()->courses()->with('activeEnrollments')->get();

        $stats = [
            'total_courses' => $courses->count(),
            'total_students' => $courses->sum(fn ($c) => $c->activeEnrollments->count()),
            'today_attendance' => 0,
        ];

        // Calculate today's attendance
        foreach ($courses as $course) {
            $stats['today_attendance'] += $course->getAttendanceStats()['present_today'];
        }

        return Inertia::render('Teacher/Dashboard', [
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }

    /**
     * Show teacher's courses.
     * GET /teacher/courses
     */
    public function showCourses(): Response
    {
        $courses = auth()->user()->courses()
            ->with(['activeEnrollments', 'qrSessions'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Teacher/Courses', [
            'courses' => $courses->map(function (Course $course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name' => $course->name,
                    'description' => $course->description,
                    'semester' => $course->semester,
                    'academic_year' => $course->academic_year,
                    'student_count' => $course->activeEnrollments->count(),
                    'max_students' => $course->max_students,
                    'created_at' => $course->created_at->format('Y-m-d'),
                ];
            }),
        ]);
    }

    /**
     * Show QR code generation page.
     * GET /courses/{courseId}/generate-qr
     */
    public function showGenerateQR(Course $course): Response
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Get the latest active QR session if it exists
        $currentQRSession = $course->activeQRSessions()
            ->latest()
            ->first();

        return Inertia::render('Teacher/GenerateQR', [
            'course' => $course,
            'current_qr' => $currentQRSession ? [
                'id' => $currentQRSession->id,
                'token' => $currentQRSession->token,
                'expires_at' => $currentQRSession->expires_at,
                'time_remaining' => $currentQRSession->getTimeRemainingSeconds(),
                'attendance_count' => $currentQRSession->attendance_count,
                'qr_code_path' => $currentQRSession->qr_code_path,
            ] : null,
        ]);
    }

    /**
     * Generate a new QR code for a course.
     * POST /courses/{courseId}/qr
     */
    public function generateQR(Course $course)
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        try {
            // Create QR session with 30-second validity
            $qrSession = QRSession::createForCourse(
                course: $course,
                teacher: auth()->user(),
                validitySeconds: config('attendance.qr_validity_seconds', 30)
            );

            // Log action
            AuditLog::logAction(
                action: 'qr_generated',
                entityType: 'QRSession',
                entityId: $qrSession->id,
                newValues: [
                    'course_id' => $course->id,
                    'token' => $qrSession->token,
                    'expires_at' => $qrSession->expires_at,
                ]
            );

            return response()->json([
                'success' => true,
                'qr' => [
                    'id' => $qrSession->id,
                    'token' => $qrSession->token,
                    'expires_at' => $qrSession->expires_at,
                    'time_remaining' => $qrSession->getTimeRemainingSeconds(),
                    'attendance_count' => 0,
                ],
                'message' => 'QR code generated successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh QR code (create new one).
     * POST /courses/{courseId}/qr/refresh
     */
    public function refreshQR(Course $course)
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Deactivate old QR sessions
        $course->activeQRSessions()->update(['is_active' => false]);

        // Generate new QR session
        return $this->generateQR($course);
    }

    /**
     * View attendance for a course.
     * GET /courses/{courseId}/attendance
     */
    public function viewAttendance(Course $course): Response
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Get attendance summary
        $summary = $course->getAttendanceSummary();
        $stats = $course->getAttendanceStats();

        return Inertia::render('Teacher/Attendance', [
            'course' => $course->only(['id', 'code', 'name']),
            'attendance_summary' => $summary,
            'stats' => $stats,
        ]);
    }

    /**
     * Download attendance report.
     * GET /courses/{courseId}/attendance/export
     */
    public function downloadReport(Course $course)
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Get attendance data
        $summary = $course->getAttendanceSummary();

        // Generate CSV
        $filename = $course->code . '_attendance_' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($summary) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, ['Student Name', 'Email', 'Attended', 'Total Sessions', 'Attendance Rate (%)']);

            // Data rows
            foreach ($summary as $row) {
                fputcsv($file, [
                    $row['student']->name,
                    $row['student']->email,
                    $row['attended'],
                    $row['total_sessions'],
                    $row['attendance_rate'] . '%',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
