<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    // Get all messages in a conversation
    public function index(Conversation $conversation)
    {
        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Send a new message
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => Auth::id(),
            'body'            => $request->body,
            'type'            => 'user',
        ]);

        $message->load('sender');

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }
}