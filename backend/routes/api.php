<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingPaymentController;
use App\Http\Controllers\Subscription\PayMongoController;
use App\Http\Controllers\Subscription\TrialController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ReviewController;


// ── PUBLIC ROUTES ──────────────────────────────────────
Route::post('/register',     [AuthController::class, 'register']);
Route::post('/login',        [AuthController::class, 'login']);
Route::get('/listings',      [ListingController::class, 'index']);
Route::get('/listings/{id}', [ListingController::class, 'show']);

// Reviews (public viewing)
Route::get('/listings/{id}/reviews', [ReviewController::class, 'index']);

// Public: booked dates for a listing (guests see unavailable dates)
Route::get('/listings/{id}/booked-dates', [BookingController::class, 'bookedDates']);

Route::post('/send-otp',    [AuthController::class, 'sendOtp']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/verify-otp',  [AuthController::class, 'verifyOtp']);

// PayMongo webhooks — no auth (PayMongo calls these directly)
Route::post('/webhook/paymongo',         [PayMongoController::class,        'webhook']);
Route::post('/webhook/paymongo-booking', [BookingPaymentController::class,  'webhook']);

// ── PROTECTED ROUTES (logged in only) ──────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Review after booking
    Route::post('/bookings/{id}/review', [ReviewController::class, 'store']);

    // Guest: view own bookings & cancel
    Route::get('/bookings',               [BookingController::class, 'index']);
    Route::post('/bookings/check-in', [BookingController::class, 'checkIn']);
    Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Guest: booking payment flow
    Route::post('/bookings/upload-id',    [BookingPaymentController::class, 'uploadId']);
    Route::post('/bookings/pay',          [BookingPaymentController::class, 'createBookingPayment']);

    Route::get('/user', fn(Request $r) => $r->user());

    // Subscription
    Route::get('/subscription/status', [TrialController::class,       'status']);
    Route::post('/subscription/pay',   [PayMongoController::class,    'createPayment']);
});

// ── HOST ROUTES ─────────────────────────────────────────
Route::middleware(['auth:sanctum', 'check.subscription'])->group(function () {
    Route::post('/listings',        [ListingController::class, 'store']);
    Route::put('/listings/{id}',    [ListingController::class, 'update']);
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
    Route::get('/host/listings',    [ListingController::class, 'hostListings']);

    // Host: manage bookings on their listings
    Route::get('/host/bookings',                  [BookingController::class, 'hostBookings']);
    Route::patch('/host/bookings/{id}/status',    [BookingController::class, 'updateStatus']);
});

// ── ADMIN ROUTES ────────────────────────────────────────
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);

    Route::get('/users',               [AdminController::class, 'getUsers']);
    Route::delete('/users/{user}',     [AdminController::class, 'deleteUser']);
    Route::patch('/users/{user}/role', [AdminController::class, 'updateUserRole']);

    Route::get('/listings',                [AdminController::class, 'getListings']);
    Route::delete('/listings/{listing}',   [AdminController::class, 'deleteListing']);

    Route::get('/bookings',                     [AdminController::class, 'getBookings']);
    Route::patch('/bookings/{booking}/status',  [AdminController::class, 'updateBookingStatus']);
});