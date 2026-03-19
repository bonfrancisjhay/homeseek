<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    // Get all listings
    public function index()
    {
        $listings = Listing::with('user')->get();
        return response()->json($listings);
    }

    // Get single listing
    public function show($id)
    {
        $listing = Listing::with('user')->findOrFail($id);
        return response()->json($listing);
    }

    // Create listing
    public function store(Request $request)
    {
        $request->validate([
            'title'           => 'required|string',
            'description'     => 'required|string',
            'location'        => 'required|string',
            'price_per_night' => 'required|numeric',
            'max_guests'      => 'required|integer'
        ]);

        $listing = Listing::create([
            'user_id'         => $request->user()->id,
            'title'           => $request->title,
            'description'     => $request->description,
            'location'        => $request->location,
            'price_per_night' => $request->price_per_night,
            'max_guests'      => $request->max_guests,
            'photo'           => $request->photo
        ]);

        return response()->json($listing, 201);
    }

    // Update listing
    public function update(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $listing->update($request->all());
        return response()->json($listing);
    }

    // Delete listing
    public function destroy(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $listing->delete();
        return response()->json(['message' => 'Listing deleted']);
    }
}