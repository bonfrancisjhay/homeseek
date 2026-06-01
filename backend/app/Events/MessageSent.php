<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message){}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id'              => $this->message->id,
            'body'            => $this->message->body,
            'type'            => $this->message->type,
            'sender_id'       => $this->message->sender_id,
            'conversation_id' => $this->message->conversation_id,
            'sender'          => $this->message->sender,
            'created_at'      => $this->message->created_at,
        ];
    }
}