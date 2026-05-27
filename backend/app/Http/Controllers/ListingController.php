<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{
    // Get all listings
    public function index(Request $request)
{
    $query = Listing::with(['user', 'reviews'])->latest();

    // Filter by location
    if ($request->filled('location')) {
    $location = trim(explode(',', $request->location)[0]);
    
    $query->where('location', 'like', '%' . $location . '%');
}

    // Filter by guests
    if ($request->filled('guests') && $request->guests > 0) {
        $query->where('max_guests', '>=', $request->guests);
    }

    // Filter by date availability
    if ($request->filled('check_in') && $request->filled('check_out')) {

        $query->whereDoesntHave('bookings', function ($q) use ($request) {

            $q->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->where('check_in', '<', $request->check_out)
            ->where('check_out', '>', $request->check_in);

        });
    }

    return response()->json($query->get());
}

    // Get single listing
    public function show($id)
    {
        $listing = Listing::with('user')->findOrFail($id);
        return response()->json($listing);
    }

    // Get listings of logged in host
    public function hostListings(Request $request)
    {
        $listings = Listing::where('user_id', $request->user()->id)->get();
        return response()->json($listings);
    }

    // Create listing
    public function store(Request $request)
    {
        $request->validate([
            'title'           => 'required|string',
            'description'     => 'required|string',
            'location'        => 'required|string',
            'price_per_night' => 'required|numeric',
            'max_guests'      => 'required|integer',
            'images.*'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'latitude'        => 'nullable|numeric',
            'longitude'       => 'nullable|numeric',
        ]);

        // Handle multiple image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('listings', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $listing = Listing::create([
            'user_id'         => $request->user()->id,
            'title'           => $request->title,
            'description'     => $request->description,
            'location'        => $request->location,
            'price_per_night' => $request->price_per_night,
            'max_guests'      => $request->max_guests,
            'photo'           => $request->photo ?? null,
            'images'          => $imagePaths,
            'amenities'       => json_decode($request->amenities ?? '[]', true),
            'latitude'        => $request->latitude  ? (float) $request->latitude  : null,
            'longitude'       => $request->longitude ? (float) $request->longitude : null,
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

        $request->validate([
            'images.*'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        // Keep existing images the host didn't remove
        $keepImages = json_decode($request->keepImages ?? '[]', true);

        // Upload any new images
        $newImages = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('listings', 'public');
                $newImages[] = '/storage/' . $path;
            }
        }

        // Delete removed images from storage
        $removedImages = array_diff($listing->images ?? [], $keepImages);
        foreach ($removedImages as $removedPath) {
            // Convert /storage/listings/file.jpg → listings/file.jpg
            $storagePath = str_replace('/storage/', '', $removedPath);
            Storage::disk('public')->delete($storagePath);
        }

        $listing->update([
            'title'           => $request->title           ?? $listing->title,
            'description'     => $request->description     ?? $listing->description,
            'location'        => $request->location        ?? $listing->location,
            'price_per_night' => $request->price_per_night ?? $listing->price_per_night,
            'max_guests'      => $request->max_guests      ?? $listing->max_guests,
            'amenities'       => json_decode($request->amenities ?? '[]', true),
            'images'          => array_merge($keepImages, $newImages),
            'latitude'        => $request->latitude  ? (float) $request->latitude  : $listing->latitude,
            'longitude'       => $request->longitude ? (float) $request->longitude : $listing->longitude,
        ]);

        return response()->json($listing);
    }

    // Delete listing
    public function destroy(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete all associated images from storage
        foreach ($listing->images ?? [] as $imagePath) {
            $storagePath = str_replace('/storage/', '', $imagePath);
            Storage::disk('public')->delete($storagePath);
        }

        $listing->delete();
        return response()->json(['message' => 'Listing deleted']);
    }
}