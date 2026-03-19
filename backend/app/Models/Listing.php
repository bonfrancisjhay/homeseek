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
        'photo'
    ];

    // A listing belongs to a user (host)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A listing has many bookings
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}