<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\CourseEnrollment;
use App\Models\QRSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
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
            'course_id' => ['nullable', 'integer'],
            'device_info' => ['nullable', 'array'],
            'location' => ['nullable', 'array'],
            'location.latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'location.longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location.accuracy' => ['nullable', 'numeric', 'min:0', 'max:10000'],
        ]);

        try {
            $attendanceData = DB::transaction(function () use ($request) {
                $qrSession = QRSession::where('token', $request->input('token'))
                    ->with('classSession')
                    ->lockForUpdate()
                    ->first();

                if (!$qrSession) {
                    throw ValidationException::withMessages([
                        'token' => 'Invalid or expired QR code.',
                    ]);
                }

                if (!$qrSession->is_active) {
                    throw ValidationException::withMessages([
                        'token' => 'This QR code is no longer active.',
                    ]);
                }

                if ($qrSession->isExpired()) {
                    throw ValidationException::withMessages([
                        'token' => 'This QR code has expired. Please use a new one.',
                    ]);
                }

                $enrollment = CourseEnrollment::where([
                    'course_id' => $qrSession->course_id,
                    'student_id' => auth()->id(),
                    'status' => 'active',
                ])->with('course')->first();

                if (!$enrollment) {
                    throw ValidationException::withMessages([
                        'token' => 'You are not enrolled in this course.',
                    ]);
                }

                $locationPayload = $this->parseLocationPayload($request->input('location'));
                $this->validateLocationRules($qrSession, $locationPayload);

                if (
                    $qrSession->class_session_id &&
                    AttendanceRecord::where([
                        'class_session_id' => $qrSession->class_session_id,
                        'student_id' => auth()->id(),
                    ])->exists()
                ) {
                    throw ValidationException::withMessages([
                        'token' => 'You have already marked attendance for this class session.',
                    ]);
                }

                if (AttendanceRecord::where([
                    'qr_session_id' => $qrSession->id,
                    'student_id' => auth()->id(),
                ])->exists()) {
                    throw ValidationException::withMessages([
                        'token' => 'You have already marked attendance for this session.',
                    ]);
                }

                try {
                    $deviceInfo = $request->input('device_info', []);

                    if ($locationPayload) {
                        $deviceInfo['location'] = $locationPayload;
                    }

                    $record = AttendanceRecord::create([
                        'qr_session_id' => $qrSession->id,
                        'course_id' => $qrSession->course_id,
                        'class_session_id' => $qrSession->class_session_id,
                        'enrollment_id' => $enrollment->id,
                        'student_id' => auth()->id(),
                        'marked_at' => now(),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'device_info' => $deviceInfo,
                    ]);
                } catch (QueryException $e) {
                    // Unique constraint safety net for race conditions.
                    if ($e->getCode() === '23000') {
                        throw ValidationException::withMessages([
                            'token' => 'You have already marked attendance for this session.',
                        ]);
                    }

                    throw $e;
                }

                $qrSession->increment('attendance_count');

                AuditLog::logAction(
                    action: 'attendance_marked',
                    entityType: 'AttendanceRecord',
                    entityId: $record->id,
                    newValues: $record->toArray(),
                    ipAddress: $request->ip()
                );

                return [
                    'course_code' => $enrollment->course->code,
                    'course_name' => $enrollment->course->name,
                    'marked_at' => $record->marked_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Attendance marked successfully!',
                'data' => $attendanceData,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance submission failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Attendance submission failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.',
            ], 500);
        }
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

    private function validateLocationRules(QRSession $qrSession, ?array $studentLocation): void
    {
        if (!config('attendance.location.enabled', true)) {
            return;
        }

        $classSession = $qrSession->classSession;
        if (!$classSession || !$classSession->requiresLocationCheck()) {
            return;
        }

        if (!$studentLocation) {
            if (config('attendance.location.allow_fallback_without_location', true)) {
                return;
            }

            throw ValidationException::withMessages([
                'location' => 'Location permission is required for this class session.',
            ]);
        }

        if (!$classSession->hasReferenceLocation()) {
            return;
        }

        $distanceMeters = $this->calculateDistanceMeters(
            lat1: $classSession->expected_latitude,
            lon1: $classSession->expected_longitude,
            lat2: $studentLocation['latitude'],
            lon2: $studentLocation['longitude']
        );

        $effectiveRadius = (float) $classSession->allowed_radius_meters
            + (float) config('attendance.location.accuracy_tolerance_meters', 25)
            + (float) ($studentLocation['accuracy'] ?? 0);

        if ($distanceMeters > $effectiveRadius) {
            throw ValidationException::withMessages([
                'location' => 'You are outside the allowed class location range.',
            ]);
        }
    }

    private function calculateDistanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
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
            'location_required' => $qrSession->classSession?->requiresLocationCheck() ?? false,
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
