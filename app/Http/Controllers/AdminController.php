<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\AttendanceRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Show admin dashboard.
     * GET /admin/dashboard
     */
    public function dashboard(): Response
    {
        // Verify user is admin
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $stats = [
            'total_users' => User::count(),
            'total_teachers' => User::whereRole('teacher')->count(),
            'total_students' => User::whereRole('student')->count(),
            'total_courses' => Course::count(),
            'total_attendance' => AttendanceRecord::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }

    /**
     * List all users.
     * GET /admin/users
     */
    public function listUsers(): Response
    {
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $users = User::paginate(15);

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    /**
     * List all courses.
     * GET /admin/courses
     */
    public function listCourses(): Response
    {
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $courses = Course::with('teacher')
            ->withCount([
                'enrollments as total_enrollments_count',
                'activeEnrollments as active_enrollments_count',
            ])
            ->paginate(15);

        $teachers = User::where('role', 'teacher')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Courses', [
            'courses' => $courses,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Create a new course.
     * POST /admin/courses
     */
    public function storeCourse(Request $request): RedirectResponse
    {
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'teacher_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'teacher')->where('is_active', true);
                }),
            ],
            'code' => ['required', 'string', 'max:50', 'unique:courses,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'semester' => ['nullable', 'integer', 'min:1', 'max:12'],
            'academic_year' => ['nullable', 'string', 'max:10', 'regex:/^\d{4}-\d{4}$/'],
            'max_students' => [
                'required',
                'integer',
                'min:1',
                'max:' . config('attendance.attendance.max_students', 200),
            ],
        ]);

        $course = Course::create($validated);

        AuditLog::logAction(
            action: 'course_created',
            entityType: 'Course',
            entityId: $course->id,
            newValues: $course->toArray()
        );

        return redirect()
            ->route('admin.courses')
            ->with('success', 'Course created successfully.');
    }

    /**
     * List student enrollments and assignment options.
     * GET /admin/enrollments
     */
    public function listEnrollments(): Response
    {
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $enrollments = CourseEnrollment::with(['student:id,name,email', 'course:id,code,name'])
            ->orderByDesc('enrolled_at')
            ->paginate(15);

        $enrollments->getCollection()->transform(function (CourseEnrollment $enrollment) {
            return [
                'id' => $enrollment->id,
                'status' => $enrollment->status,
                'enrolled_at' => optional($enrollment->enrolled_at)->format('Y-m-d H:i:s'),
                'student' => [
                    'id' => $enrollment->student?->id,
                    'name' => $enrollment->student?->name,
                    'email' => $enrollment->student?->email,
                ],
                'course' => [
                    'id' => $enrollment->course?->id,
                    'code' => $enrollment->course?->code,
                    'name' => $enrollment->course?->name,
                ],
            ];
        });

        $students = User::where('role', 'student')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $courses = Course::withCount('activeEnrollments')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'max_students']);

        return Inertia::render('Admin/Enrollments', [
            'enrollments' => $enrollments,
            'students' => $students,
            'courses' => $courses,
        ]);
    }

    /**
     * Assign a student to a course.
     * POST /admin/enrollments
     */
    public function storeEnrollment(Request $request): RedirectResponse
    {
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'student_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'student')->where('is_active', true);
                }),
            ],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
        ]);

        $course = Course::findOrFail($validated['course_id']);

        if ($course->activeEnrollments()->count() >= $course->max_students) {
            return redirect()
                ->route('admin.enrollments')
                ->with('error', 'This course has reached its maximum student capacity.');
        }

        $existingEnrollment = CourseEnrollment::where('course_id', $validated['course_id'])
            ->where('student_id', $validated['student_id'])
            ->first();

        if ($existingEnrollment && $existingEnrollment->status === 'active') {
            return redirect()
                ->route('admin.enrollments')
                ->with('error', 'This student is already enrolled in the selected course.');
        }

        if ($existingEnrollment) {
            $oldValues = $existingEnrollment->toArray();

            $existingEnrollment->update([
                'status' => 'active',
                'enrolled_at' => now(),
            ]);

            AuditLog::logAction(
                action: 'enrollment_reactivated',
                entityType: 'CourseEnrollment',
                entityId: $existingEnrollment->id,
                newValues: $existingEnrollment->toArray(),
                oldValues: $oldValues
            );

            return redirect()
                ->route('admin.enrollments')
                ->with('success', 'Enrollment reactivated successfully.');
        }

        $enrollment = CourseEnrollment::create([
            'course_id' => $validated['course_id'],
            'student_id' => $validated['student_id'],
            'status' => 'active',
            'enrolled_at' => now(),
        ]);

        AuditLog::logAction(
            action: 'enrollment_added',
            entityType: 'CourseEnrollment',
            entityId: $enrollment->id,
            newValues: $enrollment->toArray()
        );

        return redirect()
            ->route('admin.enrollments')
            ->with('success', 'Student enrolled successfully.');
    }

    /**
     * Update enrollment status (active, dropped, completed).
     * PATCH /admin/enrollments/{enrollment}/status
     */
    public function updateEnrollmentStatus(Request $request, CourseEnrollment $enrollment): RedirectResponse
    {
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'dropped', 'completed'])],
        ]);

        $targetStatus = $validated['status'];

        if ($enrollment->status === $targetStatus) {
            return redirect()
                ->route('admin.enrollments')
                ->with('success', 'Enrollment status is already up to date.');
        }

        $enrollment->load('course');

        if ($targetStatus === 'active') {
            $activeWithoutCurrent = $enrollment->course
                ->activeEnrollments()
                ->where('course_enrollments.id', '!=', $enrollment->id)
                ->count();

            if ($activeWithoutCurrent >= $enrollment->course->max_students) {
                return redirect()
                    ->route('admin.enrollments')
                    ->with('error', 'This course has reached its maximum student capacity.');
            }
        }

        $oldValues = $enrollment->toArray();
        $payload = ['status' => $targetStatus];

        if ($targetStatus === 'active') {
            $payload['enrolled_at'] = now();
        }

        $enrollment->update($payload);

        AuditLog::logAction(
            action: 'enrollment_status_updated',
            entityType: 'CourseEnrollment',
            entityId: $enrollment->id,
            newValues: $enrollment->toArray(),
            oldValues: $oldValues
        );

        return redirect()
            ->route('admin.enrollments')
            ->with('success', 'Enrollment status updated successfully.');
    }
}
