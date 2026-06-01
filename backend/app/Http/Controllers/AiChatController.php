<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class AiChatController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate([
            'message'         => 'required|string',
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        // Save the user's message first
        $userMessage = Message::create([
            'conversation_id' => $request->conversation_id,
            'sender_id'       => Auth::id(),
            'body'            => $request->message,
            'type'            => 'user',
        ]);

        // Call Gemini API
        $response = Http::withHeaders([
            'content-type' => 'application/json',
        ])->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . config('services.gemini.key'), [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => 'You are a helpful real estate assistant for HomeSeek. 
                                    Help users find properties, answer questions about 
                                    listings, neighborhoods, pricing, and home buying process.
                                    
                                    User message: ' . $request->message
                        ]
                    ]
                ]
            ],
        ]);

        $aiReply = $response->json('candidates.0.content.parts.0.text');

        // Save AI response
        $aiMessage = Message::create([
            'conversation_id' => $request->conversation_id,
            'sender_id'       => null,
            'body'            => $aiReply,
            'type'            => 'ai',
        ]);

        return response()->json([
            'user_message' => $userMessage,
            'ai_message'   => $aiMessage,
        ]);
    }
}