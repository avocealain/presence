<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->foreignId('class_session_id')
                ->nullable()
                ->after('course_id')
                ->constrained('class_sessions')
                ->nullOnDelete()
                ->comment('Class session marked by this attendance record');

            // Prevent multiple attendance marks in the same class session.
            $table->unique(['class_session_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->dropUnique('attendance_records_class_session_id_student_id_unique');
            $table->dropConstrainedForeignId('class_session_id');
        });
    }
};

