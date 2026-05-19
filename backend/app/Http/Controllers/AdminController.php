<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Listing;
use App\Models\Booking;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Dashboard stats
    public function stats()
    {
        return response()->json([
            'total_users'     => User::count(),
            'total_listings'  => Listing::count(),
            'total_bookings'  => Booking::count(),
            'total_revenue'   => Booking::where('status', 'confirmed')->sum('total_price'),
            'recent_users'    => User::latest()->take(5)->get(),
            'recent_bookings' => Booking::with(['user', 'listing'])->latest()->take(5)->get(),
        ]);
    }

    // Users
    public function getUsers()
    {
        return User::latest()->get();
    }

    public function deleteUser(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function updateUserRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|in:guest,host,admin']);
        $user->update(['role' => $request->role]);
        return response()->json($user);
    }

    // Listings
    public function getListings()
    {
        return Listing::with('user')->latest()->get();
    }

    public function deleteListing(Listing $listing)
    {
        $listing->delete();
        return response()->json(['message' => 'Listing deleted']);
    }

    // Bookings
    public function getBookings()
    {
        return Booking::with(['user', 'listing'])->latest()->get();
    }

    public function updateBookingStatus(Request $request, Booking $booking)
    {
        $request->validate(['status' => 'required|in:pending,confirmed,cancelled']);
        $booking->update(['status' => $request->status]);
        return response()->json($booking);
    }
}