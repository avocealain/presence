<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_session_id')
                ->constrained('qr_sessions')
                ->onDelete('cascade')
                ->comment('QR session that was scanned');

            $table->foreignId('course_id')
                ->constrained('courses')
                ->comment('Course attendance was marked for');

            $table->foreignId('enrollment_id')
                ->constrained('course_enrollments')
                ->comment('Student enrollment record');

            $table->foreignId('student_id')
                ->constrained('users')
                ->comment('Student who marked attendance');

            $table->timestamp('marked_at')
                ->useCurrent()
                ->comment('When attendance was marked');

            $table->ipAddress('ip_address')
                ->nullable()
                ->comment('IP address of student device');

            $table->text('user_agent')
                ->nullable()
                ->comment('Browser/device user agent');

            $table->json('device_info')
                ->nullable()
                ->comment('Device information (OS, browser, etc)');

            $table->timestamps();

            // Prevent duplicate attendance for same QR + student
            $table->unique(['qr_session_id', 'student_id']);

            // Indexes for queries
            $table->index('course_id');
            $table->index('student_id');
            $table->index('marked_at');
            $table->index('qr_session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
