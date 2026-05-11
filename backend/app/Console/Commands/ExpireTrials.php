<?php


namespace App\Console\Commands;

use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExpireTrials extends Command
{
    protected $signature   = 'subscriptions:expire-trials';
    protected $description = 'Mark expired trials as expired';

    public function handle()
    {
        $count = Subscription::where('status', 'trialing')
            ->where('trial_ends_at', '<', Carbon::now())
            ->update(['status' => 'expired']);

        $this->info("$count trial(s) marked as expired.");
    }
}