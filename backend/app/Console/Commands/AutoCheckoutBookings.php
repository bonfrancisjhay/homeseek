<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;

class AutoCheckoutBookings extends Command
{
    protected $signature   = 'bookings:auto-checkout';
    protected $description = 'Automatically check out bookings past their check-out date';

    public function handle()
    {
        $count = Booking::where('status', 'checked_in')
            ->whereDate('check_out', '<', today())
            ->update([
                'status'         => 'checked_out',
                'checked_out_at' => now(),
            ]);

        $this->info("Auto-checked out {$count} booking(s).");
    }
}