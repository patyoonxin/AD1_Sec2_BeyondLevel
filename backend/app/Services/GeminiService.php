<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    public function generateResponse($message, $faqData)
    {
        $apiKey = env('GEMINI_API_KEY');

        /*
        |--------------------------------------------------------------------------
        | Build FAQ Context
        |--------------------------------------------------------------------------
        */

        $context = "";

        foreach ($faqData as $faq) {

            $context .= "
            Keywords: {$faq->keywords}

            English Question: {$faq->question_eng}
            English Answer: {$faq->answer_eng}

            Malay Question: {$faq->question_malay}
            Malay Answer: {$faq->answer_malay}

            -------------------------
            ";
        }

        /*
        |--------------------------------------------------------------------------
        | System Prompt
        |--------------------------------------------------------------------------
        */

        $systemPrompt = "
        You are an AI chatbot assistant for Pejabat Daerah Kulai only.

        You are ONLY allowed to answer using the FAQ information provided below.

        Rules:

        1. If the user's question is related to Pejabat Daerah Kulai
        BUT the answer cannot be found clearly in the FAQ information,
        reply ONLY with:

        'Sorry, I do not have enough information about this. Please contact a real agent for assistance.'

        2. If the user's question is unrelated to Pejabat Daerah Kulai,
        such as:
        - restaurants
        - games
        - coding
        - entertainment
        - celebrities
        - shopping
        - mathematics
        - general knowledge

        reply ONLY with:

        'Sorry, I am trained only for Pejabat Daerah Kulai related matters.'

        3. Never create or guess:
        - phone numbers
        - addresses
        - procedures
        - policies
        - application requirements
        - factual information

        4. If the FAQ information contains the answer,
        provide a short and professional response.

        5. Understand small spelling mistakes and typos.

        FAQ INFORMATION:
        {$context}
        ";

        /*
        |--------------------------------------------------------------------------
        | Gemini API Request
        |--------------------------------------------------------------------------
        */

        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={$apiKey}",
            [
                "contents" => [
                    [
                        "parts" => [
                            [
                                "text" => $systemPrompt . "\n\nUser Question: " . $message
                            ]
                        ]
                    ]
                ]
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Success
        |--------------------------------------------------------------------------
        */

        if ($response->successful()) {

            return $response->json()['candidates'][0]['content']['parts'][0]['text']
                ?? "Sorry, I do not have enough information about this. Please contact a real agent for assistance.";
        }

        /*
        |--------------------------------------------------------------------------
        | API Failed
        |--------------------------------------------------------------------------
        */

        return "Sorry, the chatbot service is temporarily unavailable. Please contact a real agent.";
    }
}