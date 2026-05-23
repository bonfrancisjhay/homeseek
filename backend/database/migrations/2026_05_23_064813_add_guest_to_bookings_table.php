<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Add after check_out if column doesn't exist
            if (!Schema::hasColumn('bookings', 'guests')) {
                $table->unsignedInteger('guests')->default(1)->after('check_out');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('guests');
        });
    }
};