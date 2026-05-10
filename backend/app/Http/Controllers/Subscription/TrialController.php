<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TrialController extends Controller
{
    public function status(Request $request)
    {
        $user         = $request->user();
        $subscription = $user->subscription;

        // Guest — no subscription needed
        if ($user->role === 'guest') {
            return response()->json([
                'role'         => 'guest',
                'subscription' => null
            ]);
        }

        // Host — no subscription row yet
        if (!$subscription) {
            return response()->json([
                'role'         => 'host',
                'subscription' => null,
                'status'       => 'none',
                'has_access'   => false,
                'days_left'    => 0,
                'message'      => 'No subscription found.'
            ]);
        }

        return response()->json([
            'role'         => $user->role,
            'subscription' => [
                'status'       => $subscription->status,
                'plan'         => $subscription->plan,
                'has_access'   => $subscription->hasAccess(),
                'days_left'    => $subscription->trialDaysLeft(),
                'trial_ends_at'=> $subscription->trial_ends_at,
                'expires_at'   => $subscription->expires_at,
                'paid_at'      => $subscription->paid_at,
            ]
        ]);
    }
}