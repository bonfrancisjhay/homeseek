<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;


class ReviewController extends Controller
{
    public function index($listingId)
    {
        $reviews = Review::with('user')
            ->where('listing_id', $listingId)
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request, $id)
{
    $request->validate([
        'rating'  => 'required|integer|min:1|max:5',
        'comment' => 'nullable|string|max:1000',
    ]);

    $booking = \App\Models\Booking::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->where('status', 'checked_out')
        ->firstOrFail();

    if ($booking->review) {
        return response()->json(['message' => 'You have already reviewed this booking.'], 422);
    }

    $review = Review::create([
        'booking_id' => $booking->id,
        'user_id'    => $request->user()->id,
        'listing_id' => $booking->listing_id,
        'rating'     => $request->rating,
        'comment'    => $request->comment,
    ]);

    return response()->json($review, 201);
}
}
