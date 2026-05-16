<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $table = 'chat_messages';

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'is_read'
    ];

    // conversation relationship
    public function conversation()
    {
        return $this->belongsTo(ChatConversation::class);
    }

    // sender (user or admin)
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}