<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'valid_id')) {
                $table->string('valid_id')->nullable()->after('guests');
            }
            if (!Schema::hasColumn('bookings', 'paymongo_payment_id')) {
                $table->string('paymongo_payment_id')->nullable()->after('valid_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['valid_id', 'paymongo_payment_id']);
        });
    }
};