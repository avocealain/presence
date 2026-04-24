<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('User who performed the action');

            $table->string('action', 255)
                ->comment('Action type (e.g., attendance_marked)');

            $table->string('entity_type', 255)
                ->nullable()
                ->comment('Type of entity affected (e.g., AttendanceRecord)');

            $table->unsignedBigInteger('entity_id')
                ->nullable()
                ->comment('ID of the affected entity');

            $table->json('old_values')
                ->nullable()
                ->comment('Previous values (if update)');

            $table->json('new_values')
                ->nullable()
                ->comment('New values (if create/update)');

            $table->ipAddress('ip_address')
                ->nullable()
                ->comment('IP address where action originated');

            $table->timestamp('created_at')
                ->useCurrent();

            // Indexes for audit trail queries
            $table->index('user_id');
            $table->index('action');
            $table->index('entity_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
