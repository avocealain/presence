<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\AttendanceRecord;
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

        $courses = Course::with('teacher')->paginate(15);

        return Inertia::render('Admin/Courses', [
            'courses' => $courses,
        ]);
    }
}
