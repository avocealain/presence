<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ClassSession;
use App\Models\Course;
use App\Models\QRSession;
use App\Services\QRCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

        $course->loadCount('activeEnrollments');
        $activeClassSession = $this->getActiveClassSession($course);

        // Get the latest active QR session if it exists
        $currentQRSession = $course->activeQRSessions()
            ->with('classSession')
            ->latest()
            ->first();

        return Inertia::render('Teacher/GenerateQR', [
            'course' => $course,
            'current_session' => $activeClassSession ? [
                'id' => $activeClassSession->id,
                'started_at' => $activeClassSession->started_at,
                'ends_at' => $activeClassSession->ends_at,
                'location_required' => $activeClassSession->location_required,
                'allowed_radius_meters' => $activeClassSession->allowed_radius_meters,
            ] : null,
            'current_qr' => $currentQRSession ? [
                'id' => $currentQRSession->id,
                'token' => $currentQRSession->token,
                'expires_at' => $currentQRSession->expires_at,
                'time_remaining' => $currentQRSession->getTimeRemainingSeconds(),
                'attendance_count' => $currentQRSession->attendance_count,
                'qr_url' => $currentQRSession->getQRUrl(),
                'class_session_id' => $currentQRSession->class_session_id,
                'location_required' => $currentQRSession->classSession?->location_required ?? false,
            ] : null,
        ]);
    }

    /**
     * Generate a new QR code for a course.
     * POST /courses/{courseId}/qr
     */
    public function generateQR(Request $request, Course $course): JsonResponse
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'location' => ['nullable', 'array'],
            'location.latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'location.longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location.accuracy' => ['nullable', 'numeric', 'min:0', 'max:10000'],
        ]);

        try {
            Log::info('Starting QR generation', ['course_id' => $course->id]);

            $locationPayload = $this->parseLocationPayload($request->input('location'));
            Log::info('Location payload parsed');

            // Ensure only one active QR session exists per course.
            $course->activeQRSessions()->update(['is_active' => false]);
            Log::info('Old QR sessions deactivated');

            // Reuse existing active class session. Refresh QR should not create a new session.
            $classSession = $this->getOrCreateActiveClassSession($course, $locationPayload);
            Log::info('Class session ready', ['session_id' => $classSession->id ?? null]);

            // Create QR session with 5-minute validity
            $qrSession = QRSession::createForCourse(
                course: $course,
                teacher: auth()->user(),
                validitySeconds: config('attendance.qr.validity_seconds', 300),
                classSession: $classSession
            );
            Log::info('QR session created', ['qr_session_id' => $qrSession->id]);

            // Generate QR code image
            $qrCodeService = new QRCodeService();
            $qrUrl = $qrCodeService->generate($qrSession);
            Log::info('QR code generated', ['url' => $qrUrl]);

            // Log action
            AuditLog::logAction(
                action: 'qr_generated',
                entityType: 'QRSession',
                entityId: $qrSession->id,
                newValues: [
                    'course_id' => $course->id,
                    'class_session_id' => $classSession->id,
                    'token' => $qrSession->token,
                    'expires_at' => $qrSession->expires_at,
                    'qr_code_path' => $qrSession->qr_code_path,
                    'location_required' => $classSession->location_required,
                ]
            );

            return response()->json([
                'success' => true,
                'qr_session_id' => $qrSession->id,
                'token' => $qrSession->token,
                'qr_url' => $qrUrl,
                'expires_at' => $qrSession->expires_at,
                'validity_seconds' => config('attendance.qr.validity_seconds', 300),
                'expires_in' => $qrSession->getTimeRemainingSeconds(),
                'attendance_count' => 0,
                'class_session_id' => $classSession->id,
                'class_session_ends_at' => $classSession->ends_at,
                'location_required' => $classSession->location_required,
                'location_radius_meters' => $classSession->allowed_radius_meters,
                'message' => 'QR code generated successfully!',
            ]);
        } catch (\Throwable $e) {
            Log::error('QR code generation failed', [
                'course_id' => $course->id,
                'error_message' => $e->getMessage(),
                'error_class' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage(),
                'error_details' => [
                    'class' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ],
            ], 500);
        }
    }

    /**
     * Refresh QR code (create new one).
     * POST /courses/{courseId}/qr/refresh
     */
    public function refreshQR(Request $request, Course $course): JsonResponse
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Deactivate old QR sessions
        $course->activeQRSessions()->update(['is_active' => false]);

        // Generate new QR session
        return $this->generateQR($request, $course);
    }

    /**
     * Stop the active QR session for a course.
     * POST /courses/{courseId}/qr/stop
     */
    public function stopQR(Course $course): JsonResponse
    {
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $course->activeQRSessions()->update(['is_active' => false]);

        $activeClassSession = $this->getActiveClassSession($course);
        if ($activeClassSession) {
            $activeClassSession->update([
                'is_active' => false,
                'ends_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'QR session stopped and class session closed.',
        ]);
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

    private function getActiveClassSession(Course $course): ?ClassSession
    {
        return $course->classSessions()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->latest('started_at')
            ->first();
    }

    private function getOrCreateActiveClassSession(Course $course, ?array $locationPayload): ClassSession
    {
        $activeClassSession = $this->getActiveClassSession($course);

        if ($activeClassSession) {
            return $activeClassSession;
        }

        // Create new class session with minimal data to avoid DB errors
        return ClassSession::create([
            'course_id' => $course->id,
            'created_by' => auth()->id(),
            'started_at' => now(),
            'ends_at' => now()->addMinutes(config('attendance.session.default_duration_minutes', 90)),
            'is_active' => true,
            'location_required' => false,  // Disable location for now to avoid DB issues
            'allowed_radius_meters' => 150,
        ]);
    }

    private function parseLocationPayload(?array $location): ?array
    {
        if (!$location || !array_key_exists('latitude', $location) || !array_key_exists('longitude', $location)) {
            return null;
        }

        return [
            'latitude' => (float) $location['latitude'],
            'longitude' => (float) $location['longitude'],
            'accuracy' => isset($location['accuracy']) ? (float) $location['accuracy'] : null,
        ];
    }
}
