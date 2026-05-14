<?php


namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PayMongoController extends Controller
{
    private $secretKey;

    public function __construct()
    {
        $this->secretKey = config('paymongo.secret_key');
    }


    public function createPayment(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:basic,pro'
        ]);

        $plans = [
            'basic' => ['amount' => 29900, 'name' => 'Basic Plan'],  
            'pro'   => ['amount' => 59900, 'name' => 'Pro Plan'],     
        ];

        $selected = $plans[$request->plan];
        $user     = $request->user();

      
        $response = Http::withBasicAuth($this->secretKey, '')
            ->post('https://api.paymongo.com/v1/links', [
                'data' => [
                    'attributes' => [
                        'amount'      => $selected['amount'],
                        'description' => "Homeseek {$selected['name']} - {$user->email}",
                        'remarks'     => "user_id:{$user->id}|plan:{$request->plan}",
                        'redirect'    => [
                        'success' => 'http://localhost:5173/payment/success',  
                        'failed'  => 'http://localhost:5173/payment/failed', 
    ], 
                    ]
                ]
            ]);


        if (!$response->successful()) {
            return response()->json([
                'message' => 'Failed to create payment link.',
                'error'   => $response->json()
            ], 500);
        }

        $link = $response->json('data.attributes');

        return response()->json([
            'payment_url'  => $link['checkout_url'], 
            'reference_id' => $response->json('data.id'),
        ]);
    }

    
    public function webhook(Request $request)
    {
        // Verify webhook signature
        // $payload   = $request->getContent();
        // $signature = $request->header('Paymongo-Signature');
        // $secret    = config('paymongo.webhook_secret');

        // if (!$this->verifySignature($payload, $signature, $secret)) {
        //     return response()->json(['message' => 'Invalid signature'], 401);
        // }

        $event = $request->json('data.attributes.type');
        $data  = $request->json('data.attributes.data');

       
        if ($event === 'link.payment.paid') {
            $remarks = $data['attributes']['remarks'] ?? '';

            
            preg_match('/user_id:(\d+)/', $remarks, $userMatch);
            preg_match('/plan:(\w+)/',    $remarks, $planMatch);

            $userId = $userMatch[1] ?? null;
            $plan   = $planMatch[1] ?? 'basic';

            if ($userId) {
                Subscription::where('user_id', $userId)->update([
                    'status'               => 'active',
                    'plan'                 => $plan,
                    'paid_at'              => now(),
                    'expires_at'           => now()->addDays(30),
                    'paymongo_payment_id'  => $data['id'] ?? null,
                ]);
            }
        }

        return response()->json(['received' => true]);
    }

    
    private function verifySignature($payload, $signature, $secret): bool
    {
        if (!$signature || !$secret) return false;

        $computed = hash_hmac('sha256', $payload, $secret);
        return hash_equals($computed, $signature);
    }
}