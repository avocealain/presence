<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Show student dashboard.
     * GET /student/dashboard
     */
    public function dashboard(): Response
    {
        $enrollments = auth()->user()->enrollments()
            ->where('status', 'active')
            ->with('course')
            ->get();

        $stats = [
            'enrolled_courses' => $enrollments->count(),
            'total_sessions' => 0,
            'total_attended' => 0,
        ];

        // Calculate stats
        foreach ($enrollments as $enrollment) {
            $attendanceStats = $enrollment->getAttendanceStats();
            $stats['total_sessions'] += $attendanceStats['total_sessions'];
            $stats['total_attended'] += $attendanceStats['attended'];
        }

        $stats['overall_attendance_rate'] = $stats['total_sessions'] > 0
            ? round(($stats['total_attended'] / $stats['total_sessions']) * 100, 2)
            : 0;

        return Inertia::render('Student/Dashboard', [
            'enrollments' => $enrollments->map(function ($enrollment) {
                $stats = $enrollment->getAttendanceStats();
                return [
                    'id' => $enrollment->id,
                    'course' => $enrollment->course,
                    'enrolled_at' => $enrollment->enrolled_at->format('Y-m-d'),
                    'status' => $enrollment->status,
                    'attendance' => $stats,
                ];
            }),
            'stats' => $stats,
        ]);
    }

    /**
     * Show student's enrolled courses.
     * GET /student/courses
     */
    public function showCourses(): Response
    {
        $enrollments = auth()->user()->enrollments()
            ->where('status', 'active')
            ->with(['course', 'course.teacher'])
            ->orderByDesc('enrolled_at')
            ->get();

        return Inertia::render('Student/Courses', [
            'courses' => $enrollments->map(function ($enrollment) {
                $stats = $enrollment->getAttendanceStats();
                return [
                    'id' => $enrollment->course->id,
                    'code' => $enrollment->course->code,
                    'name' => $enrollment->course->name,
                    'description' => $enrollment->course->description,
                    'teacher' => $enrollment->course->teacher->name,
                    'semester' => $enrollment->course->semester,
                    'academic_year' => $enrollment->course->academic_year,
                    'attendance' => $stats,
                ];
            }),
        ]);
    }

    /**
     * Show QR scanner page.
     * GET /student/scanner
     */
    public function showScanner(): Response
    {
        $enrollments = auth()->user()->enrollments()
            ->where('status', 'active')
            ->with('course')
            ->get();

        return Inertia::render('Student/Scanner', [
            'courses' => $enrollments->map(fn ($e) => [
                'id' => $e->course->id,
                'code' => $e->course->code,
                'name' => $e->course->name,
            ]),
        ]);
    }

    /**
     * Show attendance history.
     * GET /student/attendance-history
     */
    public function showAttendanceHistory(): Response
    {
        $records = AttendanceRecord::where('student_id', auth()->id())
            ->with(['course', 'qrSession'])
            ->orderByDesc('marked_at')
            ->paginate(20);

        return Inertia::render('Student/AttendanceHistory', [
            'records' => $records->map(function ($record) {
                return [
                    'id' => $record->id,
                    'course_code' => $record->course->code,
                    'course_name' => $record->course->name,
                    'marked_at' => $record->marked_at->format('Y-m-d H:i:s'),
                    'hours_ago' => $record->getHoursAgo(),
                    'device' => $record->getDeviceString(),
                    'ip_address' => $record->ip_address,
                ];
            }),
            'pagination' => [
                'current_page' => $records->currentPage(),
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'last_page' => $records->lastPage(),
            ],
        ]);
    }

    /**
     * Get attendance history (API for pagination).
     * GET /api/student/attendance-history
     */
    public function getAttendanceHistory()
    {
        $records = AttendanceRecord::where('student_id', auth()->id())
            ->with(['course'])
            ->orderByDesc('marked_at')
            ->paginate(10);

        return response()->json([
            'data' => $records->items(),
            'pagination' => [
                'current_page' => $records->currentPage(),
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'last_page' => $records->lastPage(),
            ],
        ]);
    }
}
