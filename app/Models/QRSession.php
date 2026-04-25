<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class QRSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'class_session_id',
        'token',
        'qr_code_path',
        'started_at',
        'expires_at',
        'is_active',
        'attendance_count',
        'created_by',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the course this QR session belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the class session this QR refresh belongs to.
     */
    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    /**
     * Get the teacher who created this QR session.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all attendance records for this QR session.
     */
    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    /**
     * Check if QR session is expired.
     */
    public function isExpired(): bool
    {
        return now()->gt($this->expires_at);
    }

    /**
     * Check if QR session is currently valid.
     */
    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired();
    }

    /**
     * Deactivate this QR session.
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Get the QR code data (what's encoded in the QR).
     */
    public function getQRCodeData(): string
    {
        return $this->token;
    }

    /**
     * Generate a new unique token for QR code.
     */
    public static function generateToken(): string
    {
        $token = Str::random(32);

        // Ensure uniqueness
        while (static::where('token', $token)->exists()) {
            $token = Str::random(32);
        }

        return $token;
    }

    /**
     * Create a new QR session for a course.
     */
    public static function createForCourse(
        Course $course,
        User $teacher,
        int $validitySeconds = 30,
        ?ClassSession $classSession = null
    ): self
    {
        $token = self::generateToken();

        return self::create([
            'course_id' => $course->id,
            'class_session_id' => $classSession?->id,
            'token' => $token,
            'started_at' => now(),
            'expires_at' => now()->addSeconds($validitySeconds),
            'is_active' => true,
            'created_by' => $teacher->id,
        ]);
    }

    /**
     * Get the time remaining in seconds.
     */
    public function getTimeRemainingSeconds(): int
    {
        $remaining = now()->diffInSeconds($this->expires_at, false);

        return max(0, $remaining);
    }

    /**
     * Check if this QR code can still accept attendance.
     */
    public function canAcceptAttendance(): bool
    {
        return $this->is_active && $this->getTimeRemainingSeconds() > 0;
    }

    /**
     * Increment the attendance count for this QR session.
     */
    public function incrementAttendanceCount(): void
    {
        $this->increment('attendance_count');
    }

    /**
     * Deactivate if expired, otherwise keep active.
     */
    public function deactivateIfExpired(): void
    {
        if ($this->isExpired()) {
            $this->deactivate();
        }
    }

    /**
     * Get the public URL to the QR code image.
     */
    public function getQRUrl(): ?string
    {
        if (!$this->qr_code_path) {
            return null;
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->qr_code_path);
    }
}
