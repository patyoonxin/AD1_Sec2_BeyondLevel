<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatMessage;
use App\Models\ChatConversation;

class ChatMessageController extends Controller
{
    /**
     * Send a message (USER or ADMIN)
     */
    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:chat_conversations,id',
            'sender_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $message = ChatMessage::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $request->sender_id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // Update conversation timestamp (important for admin sorting)
        ChatConversation::where('id', $request->conversation_id)
            ->update(['updated_at' => now()]);

        return response()->json([
            'message' => 'Message sent',
            'data' => $message
        ]);
    }

    /**
     * Get all messages in a conversation
     */
    public function index($conversationId)
    {
        $messages = ChatMessage::with('sender')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Mark messages as read (admin or user view)
     */
    public function markAsRead($conversationId)
    {
        ChatMessage::where('conversation_id', $conversationId)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'Messages marked as read'
        ]);
    }
}