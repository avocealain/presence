<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('class_sessions', function (Blueprint $table) {
            // Add location fields if they don't exist
            if (!Schema::hasColumn('class_sessions', 'expected_latitude')) {
                $table->decimal('expected_latitude', 10, 7)->nullable()->after('location_required');
            }
            if (!Schema::hasColumn('class_sessions', 'expected_longitude')) {
                $table->decimal('expected_longitude', 10, 7)->nullable()->after('expected_latitude');
            }
            if (!Schema::hasColumn('class_sessions', 'allowed_radius_meters')) {
                $table->unsignedInteger('allowed_radius_meters')->default(150)->after('expected_longitude');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->dropColumnIfExists(['expected_latitude', 'expected_longitude', 'allowed_radius_meters']);
        });
    }
};
