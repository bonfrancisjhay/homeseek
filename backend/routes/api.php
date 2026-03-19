<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/boarding-houses', function () {
    return response()->json([
        'message' => 'Connected!',
        'data' => []
    ]);
});