<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'teacher', 'student'])
                ->default('student')
                ->after('password')
                ->comment('User role for access control');

            $table->string('department')
                ->nullable()
                ->after('role')
                ->comment('Department name (e.g., Computer Science)');

            $table->boolean('is_active')
                ->default(true)
                ->after('department')
                ->comment('Whether user account is active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'department', 'is_active']);
        });
    }
};
