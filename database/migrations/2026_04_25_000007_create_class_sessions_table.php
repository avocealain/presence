<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')
                ->constrained('courses')
                ->onDelete('cascade')
                ->comment('Course linked to this class session');

            $table->foreignId('created_by')
                ->constrained('users')
                ->comment('Teacher who started the class session');

            $table->timestamp('started_at')
                ->useCurrent()
                ->comment('Class session start time');

            $table->timestamp('ends_at')
                ->nullable()
                ->comment('Class session expected/end time');

            $table->boolean('is_active')
                ->default(true)
                ->comment('Whether the class session is currently active');

            $table->boolean('location_required')
                ->default(false)
                ->comment('Whether student geolocation check is required');

            $table->decimal('expected_latitude', 10, 7)
                ->nullable()
                ->comment('Teacher/session latitude reference');

            $table->decimal('expected_longitude', 10, 7)
                ->nullable()
                ->comment('Teacher/session longitude reference');

            $table->unsignedInteger('allowed_radius_meters')
                ->default(150)
                ->comment('Allowed radius around teacher location');

            $table->timestamps();

            $table->index(['course_id', 'is_active']);
            $table->index(['started_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};

