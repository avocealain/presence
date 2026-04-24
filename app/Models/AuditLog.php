<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // Audit logs are immutable

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
    ];

    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json',
    ];

    /**
     * Get the user who performed this action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    /**
     * Log an action.
     */
    public static function logAction(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $newValues = null,
        ?array $oldValues = null,
        ?string $ipAddress = null
    ): self {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'new_values' => $newValues,
            'old_values' => $oldValues,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }

    /**
     * Get logs for a specific user.
     */
    public static function forUser(int $userId)
    {
        return static::where('user_id', $userId)->latest();
    }

    /**
     * Get logs for a specific action.
     */
    public static function forAction(string $action)
    {
        return static::where('action', $action)->latest();
    }

    /**
     * Get logs for a specific entity.
     */
    public static function forEntity(string $entityType, int $entityId)
    {
        return static::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->latest();
    }

    /**
     * Get log description for display.
     */
    public function getDescription(): string
    {
        $user = $this->user?->name ?? 'Unknown User';

        return match ($this->action) {
            'attendance_marked' => "{$user} marked attendance for {$this->entity_type}",
            'qr_generated' => "{$user} generated a new QR code",
            'course_created' => "{$user} created a course",
            'enrollment_added' => "{$user} enrolled a student",
            default => "{$user} performed action: {$this->action}",
        };
    }
}
