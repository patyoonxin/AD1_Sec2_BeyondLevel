<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatMessage;
use App\Models\ChatConversation;
use App\Models\Faq;
use App\Models\User;

class ChatMessageController extends Controller
{
    /**
     * Send a message (USER or ADMIN).
     *
     * When a USER sends a message, the system checks the FAQ table for a match.
     * If found, an automated reply is sent on behalf of the admin bot.
     * This enables smart auto-reply for real agent conversations.
     */
    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:chat_conversations,id',
            'sender_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        // Save the user's message
        $message = ChatMessage::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $request->sender_id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // Update conversation timestamp
        ChatConversation::where('id', $request->conversation_id)
            ->update(['updated_at' => now()]);

        // ── Auto-reply: check if sender is a regular user ─────────────────────
        $sender = User::find($request->sender_id);
        $autoReply = null;

        if ($sender && $sender->role === 'user') {
            $autoReply = $this->findFaqAnswer($request->message);

            if ($autoReply) {
                // Find the admin user to send reply as
                $admin = User::where('role', 'admin')->first();

                if ($admin) {
                    $replyMessage = ChatMessage::create([
                        'conversation_id' => $request->conversation_id,
                        'sender_id' => $admin->id,
                        'message' => $autoReply,
                        'is_read' => false,
                    ]);

                    ChatConversation::where('id', $request->conversation_id)
                        ->update(['updated_at' => now()]);
                }
            }
        }

        return response()->json([
            'message' => 'Message sent',
            'data' => $message,
            'auto_reply' => $autoReply ? [
                'triggered' => true,
                'answer' => $autoReply,
                'source' => 'faq',
            ] : ['triggered' => false],
        ]);
    }

    /**
     * Search FAQ table for a matching answer based on user message.
     * Checks keywords, English question, and Malay question fields.
     *
     * @param  string $userMessage
     * @return string|null  The answer if matched, null otherwise
     */
    private function findFaqAnswer(string $userMessage): ?string
    {
        $query = strtolower(trim($userMessage));

        // 1. Direct keyword / question match
        $faq = Faq::where(function ($q) use ($query) {
            $q->whereRaw('LOWER(keywords) LIKE ?', ["%{$query}%"])
                ->orWhereRaw('LOWER(question_eng) LIKE ?', ["%{$query}%"])
                ->orWhereRaw('LOWER(question_malay) LIKE ?', ["%{$query}%"]);
        })
            ->first();

        if ($faq) {
            return $faq->answer_eng;
        }

        // 2. Word-by-word keyword matching (partial match on individual words)
        $words = array_filter(explode(' ', $query), fn($w) => strlen($w) > 2);

        foreach ($words as $word) {
            $faq = Faq::whereRaw('LOWER(keywords) LIKE ?', ["%{$word}%"])
                ->orWhereRaw('LOWER(question_eng) LIKE ?', ["%{$word}%"])
                ->orWhereRaw('LOWER(question_malay) LIKE ?', ["%{$word}%"])
                ->first();

            if ($faq) {
                return $faq->answer_eng;
            }
        }

        return null; // No FAQ match — let real agent handle it
    }

    /**
     * Get all messages in a conversation.
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
     * Mark messages as read (admin or user view).
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