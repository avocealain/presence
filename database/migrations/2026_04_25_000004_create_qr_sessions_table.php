<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')
                ->constrained('courses')
                ->onDelete('cascade')
                ->comment('Course this QR session belongs to');

            $table->string('token', 255)
                ->unique()
                ->comment('Unique token encoded in QR code');

            $table->string('qr_code_path', 255)
                ->nullable()
                ->comment('Path to generated QR image file');

            $table->timestamp('started_at')
                ->useCurrent()
                ->comment('When this QR session started');

            $table->timestamp('expires_at')
                ->nullable()
                ->comment('When this QR session expires (30 seconds)');

            $table->boolean('is_active')
                ->default(true)
                ->comment('Whether this QR is currently active');

            $table->integer('attendance_count')
                ->default(0)
                ->comment('Number of students who scanned this QR');

            $table->foreignId('created_by')
                ->constrained('users')
                ->comment('Teacher who created this QR session');

            $table->timestamps();

            // Indexes for queries
            $table->index('course_id');
            $table->index('token');
            $table->index('is_active');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_sessions');
    }
};
