<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookingPaymentController extends Controller
{
    private $secretKey;

    public function __construct()
    {
        $this->secretKey = config('paymongo.secret_key');
    }

    // ──────────────────────────────────────────────────────
    // STEP 1 — Guest uploads valid ID
    // POST /bookings/upload-id
    // ──────────────────────────────────────────────────────
    public function uploadId(Request $request)
    {
        $request->validate([
            'valid_id' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ]);

        $path = $request->file('valid_id')->store('valid_ids', 'public');

        return response()->json([
            'valid_id_path' => $path,
        ]);
    }

    // ──────────────────────────────────────────────────────
    // STEP 2 — Create PayMongo payment link for booking
    // POST /bookings/pay
    // ──────────────────────────────────────────────────────
    public function createBookingPayment(Request $request)
    {
        $request->validate([
            'listing_id'   => 'required|exists:listings,id',
            'check_in'     => 'required|date|after:today',
            'check_out'    => 'required|date|after:check_in',
            'guests'       => 'required|integer|min:1',
            'valid_id_path'=> 'required|string',
        ]);

        $listing = Listing::findOrFail($request->listing_id);
        $user    = $request->user();

        // Guest count check
        if ($request->guests > $listing->max_guests) {
            return response()->json([
                'message' => "This listing allows a maximum of {$listing->max_guests} guests."
            ], 422);
        }

        // Overlap check
        $overlap = Booking::where('listing_id', $request->listing_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($request) {
                $q->whereBetween('check_in',  [$request->check_in, $request->check_out])
                  ->orWhereBetween('check_out', [$request->check_in, $request->check_out])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('check_in',  '<=', $request->check_in)
                         ->where('check_out', '>=', $request->check_out);
                  });
            })->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'These dates are already booked. Please choose different dates.'
            ], 422);
        }

        // Calculate total
        $checkIn  = new \DateTime($request->check_in);
        $checkOut = new \DateTime($request->check_out);
        $nights   = $checkIn->diff($checkOut)->days;
        $subtotal = $nights * $listing->price_per_night;
        $fee      = round($subtotal * 0.14);
        $total    = $subtotal + $fee;

        // Amount in centavos for PayMongo
        $amountCentavos = (int) round($total * 100);

        // Pack all booking data into remarks so the webhook can create the booking
        $remarks = implode('|', [
            "user_id:{$user->id}",
            "listing_id:{$request->listing_id}",
            "check_in:{$request->check_in}",
            "check_out:{$request->check_out}",
            "guests:{$request->guests}",
            "total:{$total}",
            "valid_id:" . base64_encode($request->valid_id_path),
        ]);

        $response = Http::withoutVerifying()
    ->withBasicAuth($this->secretKey, '')
    ->post('https://api.paymongo.com/v1/links', [
        'data' => [
            'attributes' => [
                'amount'      => $amountCentavos,
                'description' => "Homeseek Booking — {$listing->title}",
                'remarks'     => $remarks,
                'redirect'    => [
                    'success' => config('app.frontend_url', 'http://localhost:5173') . '/booking/success',
                    'failed'  => config('app.frontend_url', 'http://localhost:5173') . '/booking/failed',
                ],
            ]
        ]
    ]);

        if (!$response->successful()) {
            return response()->json([
                'message' => 'Failed to create payment link.',
                'error'   => $response->json(),
            ], 500);
        }

        $link = $response->json('data.attributes');

        return response()->json([
            'payment_url'  => $link['checkout_url'],
            'reference_id' => $response->json('data.id'),
            'total'        => $total,
            'nights'       => $nights,
        ]);
    }

    // ──────────────────────────────────────────────────────
    // WEBHOOK — PayMongo calls this after payment is paid
    // POST /webhook/paymongo-booking (public, no auth)
    // ──────────────────────────────────────────────────────
    public function webhook(Request $request)
    {
        $event = $request->json('data.attributes.type');
        $data  = $request->json('data.attributes.data');

        if ($event === 'link.payment.paid') {
            $remarks = $data['attributes']['remarks'] ?? '';

            // Parse all fields from remarks
            $fields = [];
            foreach (explode('|', $remarks) as $part) {
                [$key, $value] = explode(':', $part, 2);
                $fields[$key]  = $value;
            }

            $userId    = $fields['user_id']    ?? null;
            $listingId = $fields['listing_id'] ?? null;
            $checkIn   = $fields['check_in']   ?? null;
            $checkOut  = $fields['check_out']  ?? null;
            $guests    = $fields['guests']     ?? 1;
            $total     = $fields['total']      ?? 0;
            $validId   = isset($fields['valid_id']) ? base64_decode($fields['valid_id']) : null;

            if ($userId && $listingId && $checkIn && $checkOut) {

                // Prevent duplicate bookings from duplicate webhooks
                $alreadyExists = Booking::where('user_id',    $userId)
                    ->where('listing_id', $listingId)
                    ->where('check_in',   $checkIn)
                    ->where('check_out',  $checkOut)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->exists();

                if (!$alreadyExists) {
                    Booking::create([
                        'user_id'            => $userId,
                        'listing_id'         => $listingId,
                        'check_in'           => $checkIn,
                        'check_out'          => $checkOut,
                        'guests'             => (int) $guests,
                        'total_price'        => (float) $total,
                        'status'             => 'pending',
                        'valid_id'           => $validId,
                        'paymongo_payment_id'=> $data['id'] ?? null,
                        'qr_token'           => (string) Str::uuid(),  // ← add
                        'checkin_code'       => random_int(100000, 999999), // ← add
                    ]);
                }
            }
        }

        return response()->json(['received' => true]);
    }
}