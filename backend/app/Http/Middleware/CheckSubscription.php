<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckSubscription
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Not logged in
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Guests don't need a subscription
        if ($user->role === 'guest') {
            return $next($request);
        }

        // Host — check subscription
        $subscription = $user->subscription;

        // No subscription row at all
        if (!$subscription) {
            return response()->json([
                'message' => 'No subscription found. Please choose a plan.',
                'code'    => 'NO_SUBSCRIPTION'
            ], 403);
        }

        // Has access (trialing or paid active)
        if ($subscription->hasAccess()) {
            return $next($request);
        }

        // Trial expired or cancelled
        return response()->json([
            'message'       => 'Your free trial has expired. Please subscribe to continue.',
            'code'          => 'SUBSCRIPTION_EXPIRED',
            'trial_ends_at' => $subscription->trial_ends_at,
        ], 403);
    }
}