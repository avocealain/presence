<?php

namespace Tests\Feature\Attendance;

use App\Models\AttendanceRecord;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\QRSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AttendanceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_enrolled_student_can_submit_attendance_with_valid_qr(): void
    {
        [$student, , $course, $enrollment, $qrSession] = $this->createAttendanceContext();

        Sanctum::actingAs($student);

        $response = $this->postJson('/api/attendance/submit', [
            'token' => $qrSession->token,
            'device_info' => [
                'os' => 'iOS',
                'browser' => 'Safari',
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.course_code', $course->code);

        $this->assertDatabaseHas('attendance_records', [
            'qr_session_id' => $qrSession->id,
            'enrollment_id' => $enrollment->id,
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $this->assertDatabaseHas('qr_sessions', [
            'id' => $qrSession->id,
            'attendance_count' => 1,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $student->id,
            'action' => 'attendance_marked',
            'entity_type' => 'AttendanceRecord',
        ]);
    }

    public function test_student_cannot_submit_attendance_with_expired_qr(): void
    {
        [$student, , , , $qrSession] = $this->createAttendanceContext();

        $qrSession->update([
            'expires_at' => now()->subSecond(),
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson('/api/attendance/submit', [
            'token' => $qrSession->token,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('attendance_records', 0);
    }

    public function test_student_cannot_submit_duplicate_attendance_for_same_qr(): void
    {
        [$student, , , , $qrSession] = $this->createAttendanceContext();

        Sanctum::actingAs($student);

        $this->postJson('/api/attendance/submit', [
            'token' => $qrSession->token,
        ])->assertOk();

        $duplicateResponse = $this->postJson('/api/attendance/submit', [
            'token' => $qrSession->token,
        ]);

        $duplicateResponse->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('attendance_records', 1);
        $this->assertDatabaseHas('qr_sessions', [
            'id' => $qrSession->id,
            'attendance_count' => 1,
        ]);
    }

    public function test_non_student_role_cannot_submit_attendance(): void
    {
        [, $teacher, , , $qrSession] = $this->createAttendanceContext();

        Sanctum::actingAs($teacher);

        $response = $this->postJson('/api/attendance/submit', [
            'token' => $qrSession->token,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('attendance_records', 0);
    }

    public function test_validate_endpoint_returns_valid_payload_for_active_qr(): void
    {
        [$student, , $course, , $qrSession] = $this->createAttendanceContext();

        Sanctum::actingAs($student);

        $response = $this->getJson('/api/attendance/validate?token=' . $qrSession->token);

        $response->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonPath('course.id', $course->id)
            ->assertJsonPath('location_required', false);
    }

    public function test_history_endpoint_returns_only_authenticated_student_records(): void
    {
        [$student, $teacher, $course, $enrollment, $firstQr] = $this->createAttendanceContext();
        $secondQr = $this->createQrSession($course, $teacher);

        $this->createAttendanceRecord($firstQr, $enrollment, $student, now()->subMinutes(5));
        $this->createAttendanceRecord($secondQr, $enrollment, $student, now()->subMinutes(1));

        $otherStudent = User::factory()->create(['role' => 'student']);
        $otherEnrollment = CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $otherStudent->id,
            'status' => 'active',
        ]);
        $this->createAttendanceRecord($firstQr, $otherEnrollment, $otherStudent, now()->subMinutes(2));

        Sanctum::actingAs($student);

        $response = $this->getJson('/api/attendance/history');

        $response->assertOk()
            ->assertJsonPath('pagination.total', 2);

        $studentIds = collect($response->json('data'))->pluck('student_id')->unique()->values()->all();
        $this->assertSame([$student->id], $studentIds);
    }

    public function test_stats_endpoint_rejects_student_not_enrolled_in_course(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->createCourse($teacher);

        Sanctum::actingAs($student);

        $response = $this->getJson('/api/attendance/stats/' . $course->id);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Not enrolled in this course.');
    }

    public function test_stats_endpoint_returns_enrollment_attendance_stats(): void
    {
        [$student, $teacher, $course, $enrollment, $firstQr] = $this->createAttendanceContext();
        $secondQr = $this->createQrSession($course, $teacher);

        $this->createAttendanceRecord($firstQr, $enrollment, $student, now()->subMinute());

        Sanctum::actingAs($student);

        $response = $this->getJson('/api/attendance/stats/' . $course->id);

        $response->assertOk()
            ->assertJsonPath('course.id', $course->id)
            ->assertJsonPath('stats.attended', 1)
            ->assertJsonPath('stats.total_sessions', 2);

        $this->assertSame(50.0, (float) $response->json('stats.attendance_rate'));
    }

    private function createAttendanceContext(): array
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $course = $this->createCourse($teacher);

        $enrollment = CourseEnrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'active',
        ]);

        $qrSession = $this->createQrSession($course, $teacher);

        return [$student, $teacher, $course, $enrollment, $qrSession];
    }

    private function createCourse(User $teacher): Course
    {
        return Course::create([
            'teacher_id' => $teacher->id,
            'code' => 'CS' . random_int(10000, 99999),
            'name' => 'Course ' . Str::upper(Str::random(4)),
            'description' => 'Test course',
            'semester' => 1,
            'academic_year' => '2025-2026',
            'max_students' => 50,
        ]);
    }

    private function createQrSession(Course $course, User $teacher, array $overrides = []): QRSession
    {
        return QRSession::create(array_merge([
            'course_id' => $course->id,
            'class_session_id' => null,
            'token' => Str::random(32),
            'started_at' => now()->subSeconds(5),
            'expires_at' => now()->addSeconds(25),
            'is_active' => true,
            'attendance_count' => 0,
            'created_by' => $teacher->id,
        ], $overrides));
    }

    private function createAttendanceRecord(
        QRSession $qrSession,
        CourseEnrollment $enrollment,
        User $student,
        $markedAt
    ): AttendanceRecord {
        return AttendanceRecord::create([
            'qr_session_id' => $qrSession->id,
            'course_id' => $qrSession->course_id,
            'class_session_id' => $qrSession->class_session_id,
            'enrollment_id' => $enrollment->id,
            'student_id' => $student->id,
            'marked_at' => $markedAt,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'device_info' => ['os' => 'TestOS'],
        ]);
    }
}
