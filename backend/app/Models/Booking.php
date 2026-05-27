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
        'valid_id',
        'paymongo_payment_id',
        'total_price',
        'status',
        'qr_token',
        'checkin_code',
        'checked_in_at',
    ];

    protected $casts = [
        'check_in'    => 'date',
        'check_out'   => 'date',
        'total_price' => 'float',
        'guests'      => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
    public function review()
    {
        return $this->hasOne(\App\Models\Review::class);
    }
}