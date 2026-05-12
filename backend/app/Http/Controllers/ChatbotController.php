<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faq;
use App\Services\GeminiService;

class ChatbotController extends Controller
{
    public function chat(Request $request, GeminiService $gemini)
    {
        $message = $request->message;

        // 1. Check FAQ first (fast response)
        $faq = Faq::where('keywords', 'LIKE', "%$message%")
                  ->orWhere('question_eng', 'LIKE', "%$message%")
                  ->orWhere('question_malay', 'LIKE', "%$message%")
                  ->first();

        if ($faq) {
            return response()->json([
                'source' => 'faq',
                'reply' => $faq->answer_eng
            ]);
        }

        // 2. If not found → call Gemini AI
        $aiResponse = $gemini->generateResponse($message);

        return response()->json([
            'source' => 'gemini',
            'reply' => $aiResponse
        ]);
    }
}