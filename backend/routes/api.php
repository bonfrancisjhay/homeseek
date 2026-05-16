<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Subscription\PayMongoController;  
use App\Http\Controllers\Subscription\TrialController;     

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/listings',  [ListingController::class, 'index']);
Route::get('/listings/{id}', [ListingController::class, 'show']);

Route::post('/send-otp',    [AuthController::class, 'sendOtp']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/verify-otp',  [AuthController::class, 'verifyOtp']);

// PayMongo webhook — no auth (PayMongo calls this directly)
Route::post('/webhook/paymongo', [PayMongoController::class, 'webhook']); 

// Protected routes (logged in only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Subscription info — for React to get trial status & days left
    Route::get('/subscription/status', [TrialController::class, 'status']);
    Route::post('/subscription/pay',   [PayMongoController::class, 'createPayment']); 
});

// Host-only routes — must be logged in AND have active trial or paid plan
Route::middleware(['auth:sanctum', 'check.subscription'])->group(function () { 
    Route::post('/listings',          [ListingController::class, 'store']);
    Route::post('/listings/{id}',      [ListingController::class, 'update']);
    Route::delete('/listings/{id}',   [ListingController::class, 'destroy']);
    Route::get('/host/listings',      [ListingController::class, 'hostListings']);
});