<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {

            if (!Schema::hasColumn('bookings', 'qr_token')) {
                $table->string('qr_token')
                      ->nullable()
                      ->unique()
                      ->after('paymongo_payment_id');
            }

            if (!Schema::hasColumn('bookings', 'checkin_code')) {
                $table->string('checkin_code', 6)
                      ->nullable()
                      ->after('qr_token');
            }

            if (!Schema::hasColumn('bookings', 'checked_in_at')) {
                $table->timestamp('checked_in_at')
                      ->nullable()
                      ->after('checkin_code');
            }

        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'qr_token',
                'checkin_code',
                'checked_in_at'
            ]);
        });
    }
};