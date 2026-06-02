<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
   
    public function index()
{
    $userId = Auth::id();

    return Conversation::with([
        'listing:id,title,location,images',
        'userOne:id,name',
        'userTwo:id,name',
        'messages' => function ($q) {
            $q->latest()->limit(1);
        }
    ])
    ->where('user_one_id', $userId)
    ->orWhere('user_two_id', $userId)
    ->latest()
    ->get()
    ->map(function ($c) use ($userId) {
        return [
            'id' => $c->id,
            'listing' => $c->listing,
            'last_message' => optional($c->messages->first())->body,
            'updated_at' => $c->updated_at,

        
            'other_user' => $c->getOtherUser($userId),
        ];
    });
}

    public function hostConversations()
{
    $userId = Auth::id();

    return Conversation::with([
            'listing:id,title,location',
            'userOne:id,name',
            'userTwo:id,name',
            'messages' => function ($q) {
                $q->latest()->limit(1);
            }
        ])
        ->where(function ($q) use ($userId) {
            $q->where('user_one_id', $userId)
              ->orWhere('user_two_id', $userId);
        })
        ->latest()
        ->get()
        ->map(function ($c) {
            return [
                'id' => $c->id,
                'listing' => $c->listing ? [
                'id' => $c->listing->id,
                'title' => $c->listing->title,
                'location' => $c->listing->location,
                'images'   => $c->listing->images->pluck('path')->toArray(),
            ] : null,
                'last_message' => optional($c->messages->first())->body,
                'updated_at' => $c->updated_at,

             
                'other_user' => $c->user_one_id === Auth::id()
                    ? $c->userTwo
                    : $c->userOne,
            ];
        });
}

   
    public function store(Request $request)
{
    $request->validate([
        'host_id'    => 'required|integer',
        'listing_id' => 'required|integer',
    ]);

    $userId    = Auth::id();
    $hostId    = $request->host_id;
    $listingId = $request->listing_id;

    $conversation = Conversation::where(function ($q) use ($userId, $hostId, $listingId) {
            $q->where('user_one_id', $userId)
              ->where('user_two_id', $hostId)
              ->where('listing_id',  $listingId);
        })
        ->orWhere(function ($q) use ($userId, $hostId, $listingId) {
            $q->where('user_one_id', $hostId)
              ->where('user_two_id', $userId)
              ->where('listing_id',  $listingId);
        })
        ->first();

    $isNew = false;
    if (!$conversation) {
        $conversation = Conversation::create([
            'user_one_id' => $userId,
            'user_two_id' => $hostId,
            'listing_id'  => $listingId,
        ]);
        $isNew = true;
    }

    $conversation->load([
        'listing:id,title,location,images',
        'userOne:id,name',
        'userTwo:id,name',
        'messages' => fn($q) => $q->latest()->limit(1),
    ]);

    return response()->json([
        'id'           => $conversation->id,
        'is_new'       => $isNew,               
        'listing'      => $conversation->listing,
        'last_message' => optional($conversation->messages->first())->body, 
        'updated_at'   => $conversation->updated_at,
        'other_user'   => $conversation->user_one_id === $userId
                            ? $conversation->userTwo
                            : $conversation->userOne,
    ]);
}

    public function show(Conversation $conversation)
{
    $conversation->load([
        'listing:id,title,location,images',
        'userOne:id,name',
        'userTwo:id,name',
        'messages' => fn($q) => $q->latest()->limit(1),
    ]);

    $userId = Auth::id();

    return response()->json([
        'id'           => $conversation->id,
        'listing'      => $conversation->listing,
        'last_message' => optional($conversation->messages->first())->body,
        'updated_at'   => $conversation->updated_at,
        'other_user'   => $conversation->user_one_id === $userId
                            ? $conversation->userTwo
                            : $conversation->userOne,
    ]);
}
}