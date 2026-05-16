<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatConversation;

class ChatConversationController extends Controller
{
    /**
     * Create or return existing open conversation
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Check if user already has an open conversation
        $conversation = ChatConversation::where('user_id', $request->user_id)
            ->where('status', 'open')
            ->first();

        if ($conversation) {
            return response()->json([
                'message' => 'Existing conversation found',
                'data' => $conversation
            ]);
        }

        // Create new conversation
        $conversation = ChatConversation::create([
            'user_id' => $request->user_id,
            'status' => 'open'
        ]);

        return response()->json([
            'message' => 'Conversation created',
            'data' => $conversation
        ]);
    }

    /**
     * Admin: get all conversations
     */
    public function index()
    {
        return ChatConversation::with(['user', 'messages'])
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    /**
     * Get single conversation with messages
     */
    public function show($id)
    {
        return ChatConversation::with([
            'user',
            'messages.sender'
        ])->findOrFail($id);
    }

    /**
     * Close conversation (admin action)
     */
    public function close($id)
    {
        $conversation = ChatConversation::findOrFail($id);

        $conversation->update([
            'status' => 'closed'
        ]);

        return response()->json([
            'message' => 'Conversation closed successfully'
        ]);
    }
}