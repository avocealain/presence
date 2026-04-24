<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'code',
        'name',
        'description',
        'semester',
        'academic_year',
        'max_students',
    ];

    protected $casts = [
        'max_students' => 'integer',
        'semester' => 'integer',
    ];

    /**
     * Get the teacher who created this course.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get all enrollments for this course.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    /**
     * Get all students enrolled in this course (through enrollments).
     */
    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(
            User::class,
            CourseEnrollment::class,
            'course_id',      // Foreign key on enrollments
            'id',             // Local key on users
            'id',             // Local key on courses
            'student_id'      // Foreign key on enrollments
        );
    }

    /**
     * Get all active enrollments for this course.
     */
    public function activeEnrollments(): HasMany
    {
        return $this->enrollments()->where('status', 'active');
    }

    /**
     * Get all QR sessions for this course.
     */
    public function qrSessions(): HasMany
    {
        return $this->hasMany(QRSession::class);
    }

    /**
     * Get all attendance records for this course.
     */
    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    /**
     * Get active QR sessions for this course.
     */
    public function activeQRSessions(): HasMany
    {
        return $this->qrSessions()
            ->where('is_active', true)
            ->where('expires_at', '>', now());
    }

    /**
     * Get attendance statistics for this course.
     */
    public function getAttendanceStats(): array
    {
        $totalStudents = $this->activeEnrollments()->count();
        $presentToday = $this->attendanceRecords()
            ->whereDate('marked_at', today())
            ->distinct('student_id')
            ->count('student_id');

        return [
            'total_students' => $totalStudents,
            'present_today' => $presentToday,
            'absent_today' => $totalStudents - $presentToday,
            'attendance_rate' => $totalStudents > 0 ? round(($presentToday / $totalStudents) * 100, 2) : 0,
        ];
    }

    /**
     * Get attendance record for a specific student.
     */
    public function getStudentAttendance(int $studentId): Collection
    {
        return $this->attendanceRecords()
            ->where('student_id', $studentId)
            ->orderByDesc('marked_at')
            ->get();
    }

    /**
     * Get attendance summary for each student.
     */
    public function getAttendanceSummary(): array
    {
        $enrollments = $this->activeEnrollments()->with('student')->get();
        $totalSessions = $this->qrSessions()->count();

        return $enrollments->map(function (CourseEnrollment $enrollment) use ($totalSessions) {
            $attended = AttendanceRecord::where('student_id', $enrollment->student_id)
                ->where('course_id', $this->id)
                ->count();

            return [
                'student' => $enrollment->student,
                'attended' => $attended,
                'total_sessions' => $totalSessions,
                'attendance_rate' => $totalSessions > 0 ? round(($attended / $totalSessions) * 100, 2) : 0,
            ];
        })->toArray();
    }
}
