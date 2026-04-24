<?php

return [
    /*
    |--------------------------------------------------------------------------
    | QR Code Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for QR code generation and attendance tracking
    |
    */

    'qr' => [
        // How long a QR code is valid (in seconds)
        'validity_seconds' => env('QR_VALIDITY_SECONDS', 30),

        // Where to store QR code images
        'storage_path' => 'qr-codes',

        // Image format: 'png' or 'svg'
        'image_format' => 'png',

        // Size of generated PNG images (pixels)
        'size' => 300,

        // Margin around QR code (quiet zone)
        'margin' => 2,

        // Error correction level: 'low', 'medium', 'quartile', 'high'
        'error_correction' => 'high',

        // Cache QR images for this duration (seconds, 0 = no cache)
        'cache_duration' => 3600,
    ],

    /*
    |--------------------------------------------------------------------------
    | Attendance Configuration
    |--------------------------------------------------------------------------
    */

    'attendance' => [
        // Maximum students per course
        'max_students' => 200,

        // Keep audit logs for (days)
        'audit_retention_days' => 90,

        // Minimum attendance rate for alerts (percentage)
        'alert_threshold' => 50,
    ],

    /*
    |--------------------------------------------------------------------------
    | Cleanup Configuration
    |--------------------------------------------------------------------------
    */

    'cleanup' => [
        // Delete QR images after expiration (days)
        'delete_expired_after_days' => 7,

        // Delete incomplete sessions (days without attendance)
        'delete_inactive_after_days' => 14,

        // Run cleanup automatically (true/false)
        'auto_cleanup_enabled' => true,
    ],
];
