<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Get all bookings of logged in user
    public function index(Request $request)
    {
        $bookings = Booking::with('listing')
            ->where('user_id', $request->user()->id)
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
        ]);

        // Calculate total price
        $listing = Listing::findOrFail($request->listing_id);
        $checkIn  = new \DateTime($request->check_in);
        $checkOut = new \DateTime($request->check_out);
        $nights   = $checkIn->diff($checkOut)->days;
        $total    = $nights * $listing->price_per_night;

        $booking = Booking::create([
            'user_id'     => $request->user()->id,
            'listing_id'  => $request->listing_id,
            'check_in'    => $request->check_in,
            'check_out'   => $request->check_out,
            'total_price' => $total,
            'status'      => 'pending'
        ]);

        return response()->json($booking, 201);
    }
}