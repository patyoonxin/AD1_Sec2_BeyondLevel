<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatConversation extends Model
{
    protected $table = 'chat_conversations';

    protected $fillable = [
        'user_id',
        'admin_id',
        'status'
    ];

    // USER relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ADMIN relationship (same users table)
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // MESSAGES relationship
    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id');
    }
}