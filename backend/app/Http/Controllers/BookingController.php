<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    // Get all bookings of logged in user
    public function index(Request $request)
    {
        $bookings = Booking::with('listing')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($bookings);
    }

    // Create a booking
    public function store(Request $request)
    {
        $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'check_in'   => 'required|date|after:today',
            'check_out'  => 'required|date|after:check_in',
            'guests'     => 'required|integer|min:1',
        ]);

        $listing = Listing::findOrFail($request->listing_id);

        // Validate guest count does not exceed listing max
        if ($request->guests > $listing->max_guests) {
            return response()->json([
                'message' => "This listing allows a maximum of {$listing->max_guests} guests."
            ], 422);
        }

        // Check for overlapping bookings (only confirmed or pending)
        $overlap = Booking::where('listing_id', $request->listing_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('check_in',  [$request->check_in, $request->check_out])
                      ->orWhereBetween('check_out', [$request->check_in, $request->check_out])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('check_in',  '<=', $request->check_in)
                            ->where('check_out', '>=', $request->check_out);
                      });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'These dates are already booked. Please choose different dates.'
            ], 422);
        }

        // Calculate total price
        $checkIn  = new \DateTime($request->check_in);
        $checkOut = new \DateTime($request->check_out);
        $nights   = $checkIn->diff($checkOut)->days;
        $total    = $nights * $listing->price_per_night;

        $booking = Booking::create([
            'user_id'     => $request->user()->id,
            'listing_id'  => $request->listing_id,
            'check_in'    => $request->check_in,
            'check_out'   => $request->check_out,
            'guests'      => $request->guests,
            'total_price' => $total,
            'status'      => 'pending',
            'qr_token'    => (string) Str::uuid(),
            'checkin_code'=> random_int(100000, 999999),
        ]);

        return response()->json($booking->load('listing'), 201);
    }

    // Cancel a booking
    public function cancel(Request $request, $id)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking is already cancelled.'], 422);
        }
        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending bookings can be cancelled.'
            ], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json($booking);
    }

    // Get booked dates for a listing (for frontend date blocking)
    public function bookedDates($listingId)
    {
        $bookings = Booking::where('listing_id', $listingId)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('check_out', '>=', now())
            ->get(['check_in', 'check_out']);

        // Expand each booking into individual blocked dates
        $dates = [];
        foreach ($bookings as $booking) {
            $start   = new \DateTime($booking->check_in);
            $end     = new \DateTime($booking->check_out);
            $current = clone $start;

            while ($current <= $end) {
                $dates[] = $current->format('Y-m-d');
                $current->modify('+1 day');
            }
        }

        return response()->json(array_values(array_unique($dates)));
    }

    public function hostBookings(Request $request)
    {
        $bookings = Booking::with(['listing', 'user'])
        ->whereHas('listing', fn($q) => 
        $q->where('user_id', $request->user()->id)
        )
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($bookings);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:confirmed,cancelled',
        ]);
        $booking = Booking::whereHas('listing', fn($q) =>
            $q->where('user_id', $request->user()->id)
        )->findOrFail($id);
        
        $booking->update(['status' => $request->status]);

        return response()->json($booking->load(['listing', 'user']));
    }
    public function checkIn(Request $request)
{
    $request->validate([
        'qr_token' => 'required'
    ]);

    $booking = Booking::where('qr_token', $request->qr_token)
        ->with('listing', 'user')
        ->first();

    if (!$booking) {
        return response()->json([
            'message' => 'Invalid QR code'
        ], 404);
    }

    if ($booking->status !== 'confirmed') {
        return response()->json([
            'message' => 'Booking is not confirmed yet'
        ], 422);
    }

    if ($booking->checked_in_at) {
        return response()->json([
            'message' => 'Guest already checked in'
        ], 422);
    }

    $booking->update([
        'checked_in_at' => now(),
        'status' => 'checked_in'
    ]);

    return response()->json([
        'message' => 'Check-in successful',
        'booking' => $booking
    ]);
}
}