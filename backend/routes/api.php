<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Subscription\PayMongoController;
use App\Http\Controllers\Subscription\TrialController;
use App\Http\Controllers\AdminController;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/listings',  [ListingController::class, 'index']);
Route::get('/listings/{id}', [ListingController::class, 'show']);

// Public: get booked dates for a listing (so guests see unavailable dates)
Route::get('/listings/{id}/booked-dates', [BookingController::class, 'bookedDates']);

Route::post('/send-otp',    [AuthController::class, 'sendOtp']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/verify-otp',  [AuthController::class, 'verifyOtp']);

// PayMongo webhook — no auth (PayMongo calls this directly)
Route::post('/webhook/paymongo', [PayMongoController::class, 'webhook']);

// Protected routes (logged in only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Bookings
    Route::get('/bookings',              [BookingController::class, 'index']);
    Route::post('/bookings',             [BookingController::class, 'store']);
    Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Subscription
    Route::get('/subscription/status', [TrialController::class, 'status']);
    Route::post('/subscription/pay',   [PayMongoController::class, 'createPayment']);
});

// Host-only routes
Route::middleware(['auth:sanctum', 'check.subscription'])->group(function () {
    Route::post('/listings',        [ListingController::class, 'store']);
    Route::put('/listings/{id}',    [ListingController::class, 'update']);
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
    Route::get('/host/listings',    [ListingController::class, 'hostListings']);
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);

    Route::get('/users',                 [AdminController::class, 'getUsers']);
    Route::delete('/users/{user}',       [AdminController::class, 'deleteUser']);
    Route::patch('/users/{user}/role',   [AdminController::class, 'updateUserRole']);

    Route::get('/listings',              [AdminController::class, 'getListings']);
    Route::delete('/listings/{listing}', [AdminController::class, 'deleteListing']);

    Route::get('/bookings',                      [AdminController::class, 'getBookings']);
    Route::patch('/bookings/{booking}/status',   [AdminController::class, 'updateBookingStatus']);
});