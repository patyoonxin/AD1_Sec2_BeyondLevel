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

    /**
     * Categorize a complaint description using the Gemini API.
     *
     * Sends the complaint text to Gemini and asks it to predict the most
     * appropriate category from a predefined list relevant to local council services.
     *
     * @param  string  $description  The complaint description provided by the user.
     * @return string  The predicted category name.
     */
    public function categorizeComplaint(string $description): string
    {
        $apiKey = env('GEMINI_API_KEY');

        /*
        |--------------------------------------------------------------------------
        | Categorization Prompt
        |--------------------------------------------------------------------------
        | Instructs Gemini to classify the complaint into one of the predefined
        | categories relevant to Pejabat Daerah Kulai / Majlis Bandaraya services.
        | The response must be ONLY the category name, nothing else.
        */
        $prompt = "You are a complaint categorization assistant for Pejabat Daerah Kulai.

Analyze the following complaint description and classify it into EXACTLY ONE of these categories:
- Road Damage
- Waste Management
- Drainage / Flooding
- Street Lighting
- Illegal Parking
- Public Facility Damage
- Noise Complaint
- Illegal Dumping
- Health & Sanitation
- Traffic Safety
- Others

Rules:
1. Reply with ONLY the exact category name from the list above.
2. Do not add explanations, punctuation, or extra words.
3. If none fit well, reply with 'Others'.

Complaint Description: {$description}";

        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={$apiKey}",
            [
                "contents" => [
                    [
                        "parts" => [
                            [
                                "text" => $prompt
                            ]
                        ]
                    ]
                ]
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Parse Category from Response
        |--------------------------------------------------------------------------
        */
        if ($response->successful()) {
            $category = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'Others';

            // Clean up the response: trim whitespace and remove surrounding quotes
            $category = trim($category, " \t\n\r\"'");

            return $category ?: 'Others';
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback on API Failure
        |--------------------------------------------------------------------------
        | If Gemini is unreachable, default to 'Others' so the complaint
        | can still be stored successfully without blocking the user.
        */
        return 'Others';
    }
}