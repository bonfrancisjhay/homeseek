<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'price_per_night',
        'max_guests',
        'photo',      // keep existing single photo if you want
        'images',     // new — multiple photos
        'latitude',
        'longitude',
        'amenities',
    ];

    // Default images to empty array so it's never null
    protected $attributes = [
        'images' => '[]',
    ];

    protected $casts = [
        'images'    => 'array',
        'amenities' => 'array',
        'latitude'  => 'float',
        'longitude' => 'float',
    ];

    // A listing belongs to a user (host)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviews()
    {
        return $this->hasMany(\App\Models\Review::class);
    }

    // A listing has many bookings
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}