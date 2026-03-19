<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'listing_id',
        'check_in',
        'check_out',
        'total_price',
        'status'
    ];

    // A booking belongs to a user (guest)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A booking belongs to a listing
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}