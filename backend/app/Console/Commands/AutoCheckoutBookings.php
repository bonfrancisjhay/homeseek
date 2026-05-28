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
    // Checked in guests → checked_out (they stayed, can review)
    $checkedIn = Booking::where('status', 'checked_in')
        ->whereDate('check_out', '<', today())
        ->update([
            'status'         => 'checked_out',
            'checked_out_at' => now(),
        ]);

    // Confirmed but never checked in → cancelled (they never stayed, no review)
    $noShow = Booking::where('status', 'confirmed')
        ->whereDate('check_out', '<', today())
        ->update([
            'status' => 'cancelled',
        ]);

    $this->info("Auto-checked out {$checkedIn} booking(s).");
    $this->info("Cancelled {$noShow} no-show booking(s).");
}
}