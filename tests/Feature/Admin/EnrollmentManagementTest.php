<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\QRSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_enrollment_management_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/admin/enrollments');

        $response->assertOk();
    }

    public function test_admin_can_assign_student_to_course(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 2);

        $response = $this->actingAs($admin)->post('/admin/enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $response->assertRedirect(route('admin.enrollments', absolute: false));

        $this->assertDatabaseHas('course_enrollments', [
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'enrollment_added',
            'entity_type' => 'CourseEnrollment',
        ]);
    }

    public function test_non_admin_cannot_assign_student_to_course(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 2);

        $response = $this->actingAs($teacher)->post('/admin/enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('course_enrollments', 0);
    }

    public function test_admin_cannot_duplicate_active_enrollment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 2);

        CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'active',
            'enrolled_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($admin)->post('/admin/enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $response->assertRedirect(route('admin.enrollments', absolute: false));
        $response->assertSessionHas('error', 'This student is already enrolled in the selected course.');

        $this->assertDatabaseCount('course_enrollments', 1);
    }

    public function test_admin_can_reactivate_inactive_enrollment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 2);

        $enrollment = CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'dropped',
            'enrolled_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($admin)->post('/admin/enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $response->assertRedirect(route('admin.enrollments', absolute: false));
        $response->assertSessionHas('success', 'Enrollment reactivated successfully.');

        $this->assertDatabaseHas('course_enrollments', [
            'id' => $enrollment->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'enrollment_reactivated',
            'entity_type' => 'CourseEnrollment',
            'entity_id' => $enrollment->id,
        ]);
    }

    public function test_course_capacity_is_enforced_during_assignment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $studentOne = User::factory()->create(['role' => 'student']);
        $studentTwo = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 1);

        CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $studentOne->id,
            'status' => 'active',
            'enrolled_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($admin)->post('/admin/enrollments', [
            'student_id' => $studentTwo->id,
            'course_id' => $course->id,
        ]);

        $response->assertRedirect(route('admin.enrollments', absolute: false));
        $response->assertSessionHas('error', 'This course has reached its maximum student capacity.');

        $this->assertDatabaseCount('course_enrollments', 1);
    }

    public function test_admin_can_update_enrollment_status_to_dropped(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 2);

        $enrollment = CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'active',
            'enrolled_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($admin)->patch('/admin/enrollments/' . $enrollment->id . '/status', [
            'status' => 'dropped',
        ]);

        $response->assertRedirect(route('admin.enrollments', absolute: false));
        $response->assertSessionHas('success', 'Enrollment status updated successfully.');

        $this->assertDatabaseHas('course_enrollments', [
            'id' => $enrollment->id,
            'status' => 'dropped',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'enrollment_status_updated',
            'entity_type' => 'CourseEnrollment',
            'entity_id' => $enrollment->id,
        ]);
    }

    public function test_non_admin_cannot_update_enrollment_status(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 2);

        $enrollment = CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'active',
            'enrolled_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($teacher)->patch('/admin/enrollments/' . $enrollment->id . '/status', [
            'status' => 'dropped',
        ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('course_enrollments', [
            'id' => $enrollment->id,
            'status' => 'active',
        ]);
    }

    public function test_dropped_enrollment_blocks_attendance_until_reactivated(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher, 2);

        $enrollment = CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'active',
            'enrolled_at' => now()->subDay(),
        ]);

        $qrSession = $this->createQrSession($course, $teacher);

        $this->actingAs($admin)->patch('/admin/enrollments/' . $enrollment->id . '/status', [
            'status' => 'dropped',
        ])->assertRedirect(route('admin.enrollments', absolute: false));

        Sanctum::actingAs($student);

        $blockedResponse = $this->postJson('/api/attendance/submit', [
            'token' => $qrSession->token,
        ]);

        $blockedResponse->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.token.0', 'You are not enrolled in this course.');

        $this->actingAs($admin)->patch('/admin/enrollments/' . $enrollment->id . '/status', [
            'status' => 'active',
        ])->assertRedirect(route('admin.enrollments', absolute: false));

        Sanctum::actingAs($student);

        $allowedResponse = $this->postJson('/api/attendance/submit', [
            'token' => $qrSession->token,
        ]);

        $allowedResponse->assertOk()
            ->assertJsonPath('success', true);
    }

    private function createCourse(User $teacher, int $maxStudents): Course
    {
        return Course::create([
            'teacher_id' => $teacher->id,
            'code' => 'CRS' . random_int(10000, 99999),
            'name' => 'Course ' . Str::upper(Str::random(4)),
            'description' => 'Admin enrollment test course',
            'semester' => 1,
            'academic_year' => '2025-2026',
            'max_students' => $maxStudents,
        ]);
    }

    private function createQrSession(Course $course, User $teacher): QRSession
    {
        return QRSession::create([
            'course_id' => $course->id,
            'class_session_id' => null,
            'token' => Str::random(32),
            'started_at' => now()->subSeconds(5),
            'expires_at' => now()->addMinutes(5),
            'is_active' => true,
            'attendance_count' => 0,
            'created_by' => $teacher->id,
        ]);
    }
}
