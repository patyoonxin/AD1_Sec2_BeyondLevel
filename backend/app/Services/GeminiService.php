<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

        'Sorry, I do not have enough information about this. Please contact a real agent for assistance.' or 'Maaf, saya tidak mempunyai maklumat yang mencukupi mengenai perkara ini. Sila hubungi ejen sebenar untuk mendapatkan bantuan.' depending on the language of the user's question. 

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

        'Sorry, I am trained only for Pejabat Daerah Kulai related matters.' or 'Maaf, saya hanya dilatih untuk menjawab perkara yang berkaitan dengan Pejabat Daerah Kulai.' depending on the language of the user's question.

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
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
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
     * @param  string  $description    The complaint description provided by the user.
     * @param  array   $categoryNames  Live category names from the DB (optional).
     * @return string  The predicted category name.
     */
    public function categorizeComplaint(string $description, array $categoryNames = []): string
    {
        $apiKey = env('GEMINI_API_KEY');

        /*
        |--------------------------------------------------------------------------
        | Load active categories + synonyms from the database
        |--------------------------------------------------------------------------
        | Each category may have a JSON array of synonyms (alternative names).
        | We build:
        |   $canonicalMap  — every known term → canonical DB name
        |   $promptList    — list of canonical names for the Gemini prompt
        */
        $dbCategories = \App\Models\ComplaintCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['name', 'synonyms']);

        $canonicalMap  = [];
        $promptNames   = [];
        $categoryLines = [];

        foreach ($dbCategories as $cat) {
            $canonical = $cat->name;
            $promptNames[] = $canonical;
            $canonicalMap[mb_strtolower($canonical)] = $canonical;

            // Ensure synonyms is always an array — partial selects can bypass model casts
            $synonyms = $cat->synonyms;
            if (is_string($synonyms)) {
                $synonyms = json_decode($synonyms, true) ?? [];
            }
            $synonyms = $synonyms ?: [];

            foreach ($synonyms as $syn) {
                $canonicalMap[mb_strtolower(trim($syn))] = $canonical;
            }

            // Build a prompt line that includes synonyms as hints for Gemini
            if (!empty($synonyms)) {
                $synList = implode(', ', $synonyms);
                $categoryLines[] = "- {$canonical} (also known as: {$synList})";
            } else {
                $categoryLines[] = "- {$canonical}";
            }
        }

        // Fall back to a static list when the table is empty
        if (empty($promptNames)) {
            $promptNames = [
                'Road Damage', 'Waste Management', 'Drainage / Flooding',
                'Street Lighting', 'Illegal Parking', 'Public Facility Damage',
                'Noise Complaint', 'Illegal Dumping', 'Health & Sanitation',
                'Traffic Safety', 'Others',
            ];
            foreach ($promptNames as $n) {
                $canonicalMap[mb_strtolower($n)] = $n;
                $categoryLines[] = "- {$n}";
            }
        }

        $categoryList = implode("\n", $categoryLines);
        $fallback = $canonicalMap['others'] ?? $promptNames[count($promptNames) - 1];

        $prompt = "You are a complaint categorization assistant for Pejabat Daerah Kulai.

Analyze the following complaint description and classify it into EXACTLY ONE of these categories:
{$categoryList}

Rules:
1. Reply with ONLY the exact category name (the part before any parenthesis) from the list above.
2. Do not add explanations, punctuation, or extra words.
3. Use the 'also known as' hints to help match keywords in the description.
4. If none fit well, reply with '{$fallback}'.

Complaint Description: {$description}";

        $payload = [
            "contents" => [
                [
                    "parts" => [
                        ["text" => $prompt]
                    ]
                ]
            ]
        ];

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={$apiKey}";

        // Retry up to 2 times on 429 rate-limit with increasing delay
        $response  = null;
        $attempts  = 0;
        $maxRetries = 2;

        do {
            if ($attempts > 0) {
                sleep($attempts * 2);
            }
            $response = Http::timeout(15)->withoutVerifying()->post($url, $payload);
            $attempts++;
        } while ($response->status() === 429 && $attempts <= $maxRetries);

        /*
        |--------------------------------------------------------------------------
        | Parse Category from Response
        |--------------------------------------------------------------------------
        */
        if ($response->successful()) {
            $raw = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $raw = trim($raw, " \t\n\r\"'");

            // Resolve via canonicalMap: handles exact name, synonyms, and case differences
            $resolved = $canonicalMap[mb_strtolower($raw)] ?? null;

            Log::debug('Gemini categorize', [
                'raw'      => $raw,
                'resolved' => $resolved,
            ]);

            return $resolved ?: $fallback;
        }

        if ($response->status() === 429) {
            throw new \RuntimeException('Gemini rate limit exceeded. Please wait a moment before trying again.');
        }

        throw new \RuntimeException('Gemini API returned a non-successful response: ' . $response->status());
    }
}