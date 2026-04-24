<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'qr_session_id',
        'course_id',
        'enrollment_id',
        'student_id',
        'marked_at',
        'ip_address',
        'user_agent',
        'device_info',
    ];

    protected $casts = [
        'marked_at' => 'datetime',
        'device_info' => 'json',
    ];

    /**
     * Get the QR session that was scanned.
     */
    public function qrSession(): BelongsTo
    {
        return $this->belongsTo(QRSession::class);
    }

    /**
     * Get the student who marked attendance.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the course for this attendance.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the enrollment this attendance belongs to.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(CourseEnrollment::class);
    }

    /**
     * Get device information from the JSON data.
     */
    public function getDeviceInfo(): array
    {
        return $this->device_info ?? [];
    }

    /**
     * Get formatted device string for display.
     */
    public function getDeviceString(): string
    {
        if (!$this->device_info) {
            return 'Unknown';
        }

        return sprintf(
            '%s / %s',
            $this->device_info['os'] ?? 'Unknown OS',
            $this->device_info['browser'] ?? 'Unknown Browser'
        );
    }

    /**
     * Check if this attendance is from today.
     */
    public function isToday(): bool
    {
        return $this->marked_at->isToday();
    }

    /**
     * Get hours ago this was marked.
     */
    public function getHoursAgo(): int
    {
        return (int) $this->marked_at->diffInHours(now());
    }
}
