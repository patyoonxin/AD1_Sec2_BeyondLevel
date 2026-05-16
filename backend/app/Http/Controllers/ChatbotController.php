<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faq;
use App\Services\GeminiService;

class ChatbotController extends Controller
{
    public function chat(Request $request, GeminiService $gemini)
    {
        $message = strtolower(trim($request->message));

        /*
        |--------------------------------------------------------------------------
        | 1. Direct FAQ Match
        |--------------------------------------------------------------------------
        */

        $faq = Faq::where('keywords', 'LIKE', "%$message%")
                    ->orWhere('question_eng', 'LIKE', "%$message%")
                    ->orWhere('question_malay', 'LIKE', "%$message%")
                    ->first();

        /*
        |--------------------------------------------------------------------------
        | 2. FAQ Found
        |--------------------------------------------------------------------------
        */

        if ($faq) {

            return response()->json([
                'source' => 'faq',
                'reply' => $faq->answer_eng
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Get FAQ Data For Gemini Context
        |--------------------------------------------------------------------------
        */

        $faqData = Faq::select(
            'question_eng',
            'answer_eng',
            'question_malay',
            'answer_malay',
            'keywords'
        )->get();

        /*
        |--------------------------------------------------------------------------
        | 4. Gemini AI (Limited)
        |--------------------------------------------------------------------------
        */

        $aiResponse = $gemini->generateResponse($message, $faqData);

        return response()->json([
            'source' => 'gemini',
            'reply' => $aiResponse
        ]);
    }
}