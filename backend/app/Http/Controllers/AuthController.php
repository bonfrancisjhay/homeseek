<?php

namespace App\Http\Controllers;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    // Step 1 — Send OTP
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email'
        ]);

        $otp = rand(100000, 999999);

        Otp::where('email', $request->email)->delete();

        Otp::create([
            'email'      => $request->email,
            'otp'        => $otp,
            'expires_at' => Carbon::now()->addMinutes(10)
        ]);

        Mail::raw("Your Homeseek OTP code is: $otp (expires in 10 minutes)", function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Your Homeseek OTP Code');
        });

        return response()->json([
            'message' => 'OTP sent to your email'
        ]);
    }


        // Check if email exists
public function checkEmail(Request $request)
{
    $request->validate([
        'email' => 'required|email'
    ]);

    $exists = User::where('email', $request->email)->exists();

    return response()->json([
        'exists' => $exists
    ]);
}

    // Step 2 — Register with OTP
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'otp'      => 'required',
            'role'     => 'required|in:guest,host'
        ]);

        $otpRecord = Otp::where('email', $request->email)
                        ->where('otp', $request->otp)
                        ->first();

        if (!$otpRecord) {
            return response()->json([
                'message' => 'Invalid OTP'
            ], 422);
        }

        if (Carbon::now()->isAfter($otpRecord->expires_at)) {
            return response()->json([
                'message' => 'OTP expired, please request a new one'
            ], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role
        ]);

        $otpRecord->delete();

        $token = $user->createToken('homeseek')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token
        ], 201);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $request->user()->createToken('homeseek')->plainTextToken;

        return response()->json([
            'user'  => Auth::user(),
            'token' => $token
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}