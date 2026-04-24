<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('Teacher who created this course');

            $table->string('code', 50)
                ->unique()
                ->comment('Course code (e.g., CS101)');

            $table->string('name', 255)
                ->comment('Course name');

            $table->text('description')
                ->nullable()
                ->comment('Course description');

            $table->integer('semester')
                ->nullable()
                ->comment('Semester number (1, 2, 3...)');

            $table->string('academic_year', 10)
                ->nullable()
                ->comment('Academic year (e.g., 2024-2025)');

            $table->integer('max_students')
                ->default(50)
                ->comment('Maximum students allowed');

            $table->timestamps();

            // Indexes for performance
            $table->index('teacher_id');
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
