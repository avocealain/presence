<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'created_by',
        'started_at',
        'ends_at',
        'is_active',
        'location_required',
        'expected_latitude',
        'expected_longitude',
        'allowed_radius_meters',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
        'location_required' => 'boolean',
        'expected_latitude' => 'float',
        'expected_longitude' => 'float',
        'allowed_radius_meters' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function qrSessions(): HasMany
    {
        return $this->hasMany(QRSession::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        return !$this->ends_at || now()->lte($this->ends_at);
    }

    public function requiresLocationCheck(): bool
    {
        return $this->location_required === true;
    }

    public function hasReferenceLocation(): bool
    {
        return $this->expected_latitude !== null && $this->expected_longitude !== null;
    }
}

