<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\CourseEnrollment;
use App\Models\QRSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    /**
     * Submit attendance by scanning QR code.
     *
     * POST /api/attendance/submit
     * {
     *   "token": "qr_token",
     *   "device_info": { "os": "iOS", "browser": "Safari" }
     * }
     */
    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'device_info' => ['nullable', 'array'],
        ]);

        try {
            // Step 1: Find QR Session by token
            $qrSession = QRSession::where('token', $request->input('token'))->first();

            if (!$qrSession) {
                throw ValidationException::withMessages([
                    'token' => 'Invalid or expired QR code.',
                ]);
            }

            // Step 2: Check if QR session is active
            if (!$qrSession->is_active) {
                throw ValidationException::withMessages([
                    'token' => 'This QR code is no longer active.',
                ]);
            }

            // Step 3: Check if QR session has expired
            if ($qrSession->isExpired()) {
                throw ValidationException::withMessages([
                    'token' => 'This QR code has expired. Please use a new one.',
                ]);
            }

            // Step 4: Verify student is enrolled in this course
            $enrollment = CourseEnrollment::where([
                'course_id' => $qrSession->course_id,
                'student_id' => auth()->id(),
                'status' => 'active',
            ])->first();

            if (!$enrollment) {
                throw ValidationException::withMessages([
                    'token' => 'You are not enrolled in this course.',
                ]);
            }

            // Step 5: Check for duplicate attendance (same QR + student)
            if (AttendanceRecord::where([
                'qr_session_id' => $qrSession->id,
                'student_id' => auth()->id(),
            ])->exists()) {
                throw ValidationException::withMessages([
                    'token' => 'You have already marked attendance for this session.',
                ]);
            }

            // Step 6: Create attendance record
            $record = AttendanceRecord::create([
                'qr_session_id' => $qrSession->id,
                'course_id' => $qrSession->course_id,
                'enrollment_id' => $enrollment->id,
                'student_id' => auth()->id(),
                'marked_at' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_info' => $request->input('device_info'),
            ]);

            // Step 7: Increment attendance count on QR session
            $qrSession->increment('attendance_count');

            // Step 8: Log action to audit log
            AuditLog::logAction(
                action: 'attendance_marked',
                entityType: 'AttendanceRecord',
                entityId: $record->id,
                newValues: $record->toArray(),
                ipAddress: $request->ip()
            );

            return response()->json([
                'success' => true,
                'message' => 'Attendance marked successfully!',
                'data' => [
                    'course_code' => $enrollment->course->code,
                    'course_name' => $enrollment->course->name,
                    'marked_at' => $record->marked_at->format('Y-m-d H:i:s'),
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance submission failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate QR token without marking attendance.
     *
     * GET /api/attendance/validate?token=...
     */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $qrSession = QRSession::where('token', $request->input('token'))->first();

        if (!$qrSession || !$qrSession->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'QR code is invalid or expired.',
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'course' => $qrSession->course->only(['id', 'code', 'name']),
            'time_remaining' => $qrSession->getTimeRemainingSeconds(),
        ]);
    }

    /**
     * Get attendance history for the authenticated student.
     *
     * GET /api/attendance/history?course_id=...
     */
    public function history(Request $request): JsonResponse
    {
        $query = AttendanceRecord::where('student_id', auth()->id())
            ->with('course', 'qrSession')
            ->orderByDesc('marked_at');

        // Filter by course if provided
        if ($request->has('course_id')) {
            $query->where('course_id', $request->input('course_id'));
        }

        $records = $query->paginate(20);

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

    /**
     * Get attendance statistics for a student in a course.
     *
     * GET /api/attendance/stats/{courseId}
     */
    public function getStats(int $courseId): JsonResponse
    {
        $enrollment = CourseEnrollment::where([
            'course_id' => $courseId,
            'student_id' => auth()->id(),
        ])->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'Not enrolled in this course.',
            ], 403);
        }

        $stats = $enrollment->getAttendanceStats();

        return response()->json([
            'course' => $enrollment->course->only(['id', 'code', 'name']),
            'stats' => $stats,
        ]);
    }
}
