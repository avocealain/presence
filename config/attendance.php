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

        // Size of generated PNG images (pixels) - reduced for faster generation
        'size' => 200,

        // Margin around QR code (quiet zone)
        'margin' => 1,

        // Error correction level: 'low', 'medium', 'quartile', 'high'
        'error_correction' => 'medium',

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
    | Class Session Configuration
    |--------------------------------------------------------------------------
    */

    'session' => [
        // Default duration for one class session
        'default_duration_minutes' => env('ATTENDANCE_SESSION_DURATION_MINUTES', 90),
    ],

    /*
    |--------------------------------------------------------------------------
    | Location Validation Configuration
    |--------------------------------------------------------------------------
    */

    'location' => [
        // Enable geolocation checks globally
        'enabled' => env('ATTENDANCE_LOCATION_ENABLED', true),

        // Radius around teacher location considered valid
        'default_radius_meters' => env('ATTENDANCE_LOCATION_RADIUS_METERS', 150),

        // Extra tolerance added to distance checks
        'accuracy_tolerance_meters' => env('ATTENDANCE_LOCATION_ACCURACY_TOLERANCE_METERS', 25),

        // Allow attendance if student denies location permission
        'allow_fallback_without_location' => env('ATTENDANCE_LOCATION_ALLOW_FALLBACK', true),
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
