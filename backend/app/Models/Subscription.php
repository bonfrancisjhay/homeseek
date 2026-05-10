<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'trial_starts_at',
        'trial_ends_at',
        'plan',
        'paymongo_payment_id',
        'paymongo_source_id',
        'paid_at',
        'expires_at',
    ];

    protected $casts = [
        'trial_starts_at' => 'datetime',
        'trial_ends_at'   => 'datetime',
        'paid_at'         => 'datetime',
        'expires_at'      => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Is trial still active?
    public function isTrialActive(): bool
    {
        return $this->status === 'trialing'
            && Carbon::now()->isBefore($this->trial_ends_at);
    }

    // Is paid plan active?
    public function isPaidActive(): bool
    {
        return $this->status === 'active'
            && ($this->expires_at === null || Carbon::now()->isBefore($this->expires_at));
    }

    // Can access host features?
    public function hasAccess(): bool
    {
        return $this->isTrialActive() || $this->isPaidActive();
    }

    // Days left in trial
    public function trialDaysLeft(): int
    {
        if ($this->status !== 'trialing') return 0;
        return max(0, Carbon::now()->diffInDays($this->trial_ends_at, false));
    }
}