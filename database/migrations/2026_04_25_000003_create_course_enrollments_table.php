<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')
                ->constrained('courses')
                ->onDelete('cascade')
                ->comment('Course enrolled in');

            $table->foreignId('student_id')
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('Student enrolled');

            $table->timestamp('enrolled_at')
                ->useCurrent()
                ->comment('When student enrolled');

            $table->enum('status', ['active', 'dropped', 'completed'])
                ->default('active')
                ->comment('Enrollment status');

            $table->timestamps();

            // Prevent duplicate enrollments
            $table->unique(['course_id', 'student_id']);

            // Indexes for queries
            $table->index('course_id');
            $table->index('student_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
    }
};
