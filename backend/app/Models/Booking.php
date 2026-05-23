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
        'guests',
        'total_price',
        'status',
    ];

    protected $casts = [
        'check_in'    => 'date',
        'check_out'   => 'date',
        'total_price' => 'float',
        'guests'      => 'integer',
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