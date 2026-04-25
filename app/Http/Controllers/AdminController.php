<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Course;
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
            ->withCount('enrollments')
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
}
