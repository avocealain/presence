<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qr_sessions', function (Blueprint $table) {
            $table->foreignId('class_session_id')
                ->nullable()
                ->after('course_id')
                ->constrained('class_sessions')
                ->nullOnDelete()
                ->comment('Class session this QR refresh belongs to');

            $table->index(['class_session_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('qr_sessions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('class_session_id');
        });
    }
};

