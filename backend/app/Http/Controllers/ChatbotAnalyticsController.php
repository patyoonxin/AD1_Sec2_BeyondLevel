<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChatbotAnalyticsController extends Controller
{
    /**
     * UC022: Analyze Chatbot Interactions
     *
     * Retrieves and processes chatbot interaction records from the database.
     * Returns statistics, common question patterns, and conversation history.
     *
     * @return JsonResponse
     */
    public function analyze(): JsonResponse
    {
        // ── A4: Check if any data exists ─────────────────────────────────
        $totalConversations = ChatConversation::count();
        $totalMessages = ChatMessage::count();

        if ($totalConversations === 0) {
            return response()->json([
                'no_data' => true,
                'message' => 'No chatbot data available.',
                'total_conversations' => 0,
                'total_messages' => 0,
                'stats' => [],
                'common_questions' => [],
                'recent_conversations' => [],
                'daily_sessions' => [],
            ]);
        }

        // ── A1: Chatbot usage statistics ─────────────────────────────────
        $openConvs = ChatConversation::where('status', 'open')->count();
        $closedConvs = ChatConversation::where('status', 'closed')->count();
        $pendingConvs = ChatConversation::where('status', 'pending')->count();

        // User messages only (sender is a regular user, not admin)
        $userMessages = ChatMessage::whereHas('sender', fn($q) => $q->where('role', 'user'))->count();
        $adminReplies = ChatMessage::whereHas('sender', fn($q) => $q->where('role', 'admin'))->count();

        // ── A2 + A3: Identify common questions & repeated inquiries ──────
        // Group user messages by their text to find repeated patterns
        $messages = ChatMessage::with('sender')
            ->whereHas('sender', fn($q) => $q->where('role', 'user'))
            ->get();

        // ── Fetch categories from both FAQ and complaint_categories tables ──────
        $faqCategories = \App\Models\Faq::whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()->pluck('category')->toArray();

        $complaintCategories = \App\Models\ComplaintCategory::where('is_active', true)
            ->pluck('name')->toArray();

        // Merge + deduplicate + add extra categories
        $allCategories = collect(array_merge($faqCategories, $complaintCategories, [
            'Keselamatan',
            'Pertanyaan Am',
            'Status Aduan',
            'Salam',
        ]))->unique()->values()->toArray();

        // Keyword map per category — sources: FAQ keywords + complaint category names + extras
        $categoryKeywords = [
            'Kebersihan' => ['sampah', 'sarap', 'buang', 'kotor', 'waste', 'berbau', 'bersih'],
            'Infrastruktur' => ['jalan', 'rosak', 'longkang', 'banjir', 'lampu', 'tiang', 'parit', 'longkang'],
            'Fasiliti' => ['fasiliti', 'tandas', 'taman', 'padang', 'gelanggang', 'facility'],
            'Lesen' => ['lesen', 'license', 'renew', 'perniagaan', 'permit', 'business'],
            'Complaint' => ['complaint', 'aduan', 'report', 'laporkan', 'submit', 'hantar'],
            'Status Aduan' => ['status', 'semak', 'check', 'progress', 'update', 'tracker'],
            'Keselamatan' => ['pencuri', 'curi', 'rompak', 'selamat', 'polis', 'bahaya', 'jenayah'],
            'Pertanyaan Am' => ['jumpa', 'pegawai', 'officer', 'waktu', 'hour', 'office', 'telefon', 'contact', 'nombor', 'alamat'],
            'Salam' => ['hello', 'hi', 'helo', 'hai', 'salam', 'selamat'],
            'General' => ['apa', 'macam', 'mana', 'bagaimana', 'bila', 'how', 'what', 'when'],
            'Business License' => ['business', 'license', 'lesen', 'perniagaan', 'permit', 'renew'],
            'Waste' => ['sampah', 'waste', 'buang', 'sarap', 'longkang'],
        ];

        // Add FAQ categories dynamically with their keywords from DB
        $faqKeywordsMap = \App\Models\Faq::whereNotNull('category')
            ->whereNotNull('keywords')
            ->get()
            ->groupBy('category')
            ->map(fn($faqs) => $faqs->flatMap(
                fn($f) =>
                array_filter(array_map('trim', explode(',', strtolower($f->keywords ?? ''))))
            )->unique()->values()->toArray());

        foreach ($faqKeywordsMap as $cat => $kws) {
            if (!isset($categoryKeywords[$cat])) {
                $categoryKeywords[$cat] = $kws;
            } else {
                $categoryKeywords[$cat] = array_unique(array_merge($categoryKeywords[$cat], $kws));
            }
        }

        // ── Group messages by category using keyword matching ────────────────
        $grouped = [];
        foreach ($messages as $msg) {
            $msgLower = strtolower($msg->message);
            $matched = 'Lain-lain';
            $maxScore = 0;

            foreach ($categoryKeywords as $cat => $keywords) {
                $score = 0;
                foreach ($keywords as $kw) {
                    if (str_contains($msgLower, $kw))
                        $score++;
                }
                if ($score > $maxScore) {
                    $maxScore = $score;
                    $matched = $cat;
                }
            }

            if (!isset($grouped[$matched])) {
                $grouped[$matched] = ['topic' => $matched, 'count' => 0, 'messages' => []];
            }
            $grouped[$matched]['count']++;
            $grouped[$matched]['messages'][] = $msg->message;
        }

        // Build repeatedMessages from grouped categories
        arsort($grouped);
        $repeatedMessages = collect(array_values($grouped))->map(fn($g) => [
            'topic' => $g['topic'],
            'count' => $g['count'],
            'pct' => $userMessages > 0
                ? round(($g['count'] / $userMessages) * 100, 1) . '%'
                : '0%',
            'messages' => array_unique($g['messages']), // sample messages for expand view
        ]);

        // Also keep keyword frequency for top_keywords
        $keywordMap = [];
        $stopWords = [
            'saya',
            'nak',
            'macam',
            'mana',
            'yang',
            'dan',
            'atau',
            'dengan',
            'ini',
            'itu',
            'ada',
            'tak',
            'tidak',
            'untuk',
            'dalam',
            'boleh',
            'how',
            'can',
            'the',
            'and',
            'for',
            'are',
            'was',
            'what',
            'is'
        ];
        foreach ($messages as $msg) {
            $words = preg_split('/\s+/', strtolower($msg->message));
            foreach ($words as $word) {
                $word = preg_replace('/[^a-z0-9]/', '', $word);
                if (strlen($word) > 3 && !in_array($word, $stopWords)) {
                    $keywordMap[$word] = ($keywordMap[$word] ?? 0) + 1;
                }
            }
        }
        arsort($keywordMap);

        // ── Daily sessions (last 30 days) ─────────────────────────────────
        $dailySessions = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $label = $date->format('d/m');
            $count = ChatConversation::whereDate('created_at', $date->toDateString())->count();
            $dailySessions[] = ['day' => $label, 'sessions' => $count];
        }

        // ── Recent conversations (latest 10) ─────────────────────────────
        $recentConversations = ChatConversation::with([
            'user',
            'messages' => function ($q) {
                $q->orderBy('created_at', 'asc');
            }
        ])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($conv) {
                $firstMsg = $conv->messages->first();
                $lastMsg = $conv->messages->last();
                $msgCount = $conv->messages->count();
                $userName = $conv->user?->name ?? 'Unknown';
                $initials = strtoupper(substr($userName, 0, 1))
                    . strtoupper(substr(explode(' ', $userName)[1] ?? $userName, 0, 1));

                return [
                    'id' => $conv->id,
                    'initials' => $initials,
                    'name' => $userName,
                    'message' => $firstMsg?->message ?? '—',
                    'last_message' => $lastMsg?->message ?? '—',
                    'msg_count' => $msgCount,
                    'status' => $conv->status,
                    'time' => Carbon::parse($conv->updated_at)->diffForHumans(),
                ];
            });

        return response()->json([
            'no_data' => false,
            'total_conversations' => $totalConversations,
            'total_messages' => $totalMessages,
            'user_messages' => $userMessages,
            'admin_replies' => $adminReplies,
            'stats' => [
                'open' => $openConvs,
                'closed' => $closedConvs,
                'pending' => $pendingConvs,
            ],
            'common_questions' => $repeatedMessages,
            'top_keywords' => array_slice($keywordMap, 0, 10, true),
            'daily_sessions' => $dailySessions,
            'recent_conversations' => $recentConversations,
        ]);
    }
    /**
     * UC023: Interpret Queries and Generate Responses
     *
     * Retrieves recent user messages from the database, forwards them
     * to the Gemini API to interpret intent and generate automated responses.
     *
     * A1: Interpret user queries using AI
     * A2: Generate automated responses
     * A3: Gemini API unavailable — fallback to keyword-based response
     * A4: Query too vague — display default response
     *
     * @param  Request       $request
     * @param  GeminiService $gemini
     * @return JsonResponse
     */
    public function interpretQueries(Request $request, GeminiService $gemini): JsonResponse
    {
        // Fetch latest user messages from chat_messages table
        $userMessages = ChatMessage::with(['sender', 'conversation'])
            ->whereHas('sender', fn($q) => $q->where('role', 'user'))
            ->orderBy('id', 'desc')
            ->limit(20)
            ->get();

        if ($userMessages->isEmpty()) {
            return response()->json([
                'no_data' => true,
                'message' => 'No chatbot data available.',
                'results' => [],
            ]);
        }

        // ── Batch intent extraction (one Gemini API call) ─────────────────────
        $queries = $userMessages->pluck('message');
        $intents = [];

        try {
            $apiKey = env('GEMINI_API_KEY');
            $msgList = $queries->implode("\n");

            $prompt = 'For each of these user messages, write ONE short intent description (max 8 words each).' . "\n"
                . 'Reply ONLY as a JSON array of strings in the same order, no extra text.' . "\n"
                . 'Example: ["User wants to submit a complaint", "User asking about office hours"]' . "\n\n"
                . $msgList;

            $response = \Illuminate\Support\Facades\Http::timeout(60)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key={$apiKey}",
                ["contents" => [["parts" => [["text" => $prompt]]]]]
            );

            if ($response->successful()) {
                $text = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '[]';
                $clean = preg_replace('/```json|```/', '', $text);
                $decoded = json_decode(trim($clean), true);
                $intents = is_array($decoded) ? $decoded : [];
            }
        } catch (\Exception $e) {
            // Fallback — intents remain empty, will show '—'
        }

        // ── Fetch complaint categories for source badge ──────────────────────
        $categories = \App\Models\ComplaintCategory::select('id', 'name')->get();

        // ── Build results ─────────────────────────────────────────────────────
        $results = $userMessages->values()->map(function ($msg, $i) use ($intents, $categories) {
            $query = $msg->message;
            $userName = $msg->sender?->name ?? 'Unknown';
            $time = Carbon::parse($msg->created_at)->diffForHumans();

            // Fetch admin reply AFTER this message (by id, same conversation)
            $adminReply = ChatMessage::where('conversation_id', $msg->conversation_id)
                ->where('id', '>', $msg->id)
                ->whereHas('sender', fn($q) => $q->where('role', 'admin'))
                ->orderBy('id', 'asc')
                ->first();

            $botResponse = $adminReply?->message ?? null;

            // Derive source from complaint_categories keywords
            $lower = strtolower($query);
            $source = 'General';
            foreach ($categories as $cat) {
                $catLower = strtolower($cat->name);
                $keywords = array_filter(explode(' ', $catLower));
                foreach ($keywords as $kw) {
                    if (strlen($kw) > 2 && str_contains($lower, $kw)) {
                        $source = $cat->name;
                        break 2;
                    }
                }
            }
            // Extra keyword hints
            if ($source === 'General') {
                $source = match (true) {
                    str_contains($lower, 'sampah') || str_contains($lower, 'sarap') || str_contains($lower, 'buang') => 'Kebersihan',
                    str_contains($lower, 'longkang') || str_contains($lower, 'banjir') || str_contains($lower, 'jalan') => 'Infrastruktur',
                    str_contains($lower, 'lesen') || str_contains($lower, 'license') || str_contains($lower, 'permit') => 'Lesen',
                    str_contains($lower, 'complaint') || str_contains($lower, 'aduan') => 'Complaint',
                    str_contains($lower, 'hello') || str_contains($lower, 'hi') || str_contains($lower, 'helo') => 'General',
                    default => 'General',
                };
            }

            return [
                'query' => $query,
                'user_name' => $userName,
                'bot_response' => $botResponse,
                'interpreted' => $botResponse,
                'intent' => $intents[$i] ?? '—',
                'source' => $source,
                'time' => $time,
            ];
        })->toArray();

        return response()->json([
            'no_data' => false,
            'results' => $results,
            'total' => count($results),
        ]);
    }

    /**
     * UC024: Categorize User Queries Using AI
     *
     * Retrieves user messages from the database, sends them to Gemini API
     * to categorize by topic and query type for monitoring and analysis.
     *
     * A1: Categorize chatbot inquiries
     * A2: Categorize complaint-related queries
     * A3: Classify queries by topic/category
     * A4: Gemini API fails — display error, queries remain uncategorized
     * A5: No query data — display "No query data available for categorization."
     *
     * @param  GeminiService $gemini
     * @return JsonResponse
     */
    public function categorizeQueries(GeminiService $gemini): JsonResponse
    {
        // A5: Check if any user messages exist
        $messages = ChatMessage::with('sender')
            ->whereHas('sender', fn($q) => $q->where('role', 'user'))
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();

        if ($messages->isEmpty()) {
            return response()->json([
                'no_data' => true,
                'message' => 'No query data available for categorization.',
                'results' => [],
                'summary' => [],
            ]);
        }

        $results = [];
        $failed = false;

        // Fetch complaint categories from DB for topic classification
        $complaintCategories = \App\Models\ComplaintCategory::where('is_active', true)
            ->pluck('name')
            ->toArray();

        if (empty($complaintCategories)) {
            $complaintCategories = ['Fasiliti', 'Infrastruktur', 'Kebersihan', 'Lesen', 'Lain-lain'];
        }

        $categoryList = implode(', ', array_merge($complaintCategories, ['General', 'Other']));

        // Query types with clear definitions
        $queryTypes = 'Question (asking for information), Request (asking for action/service), Complaint (reporting a problem), Feedback (giving opinion), Greeting (hello/hi/salam), Other (cannot classify)';

        // Batch all messages — one Gemini call
        $allQueries = $messages->pluck('message')->values();
        $queryListStr = $allQueries->map(fn($q, $i) => ($i + 1) . '. ' . $q)->implode("
");

        $apiKey = env('GEMINI_API_KEY');
        $batchPrompt = 'You are a query classifier for Pejabat Daerah Kulai portal.' . "
"
            . 'For each numbered user message below, return a JSON array where each item has:' . "
"
            . '- "topic": one of [' . $categoryList . ']' . "
"
            . '- "type": one of [' . $queryTypes . '] — use only the word before the bracket' . "
"
            . '- "intent": short phrase max 6 words' . "

"
            . 'Reply ONLY with a valid JSON array, no markdown, no explanation.' . "
"
            . 'Example: [{"topic":"Kebersihan","type":"Complaint","intent":"Report illegal dumping"}]' . "

"
            . $queryListStr;

        $batchIntents = [];
        try {
            $batchRes = \Illuminate\Support\Facades\Http::timeout(60)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key={$apiKey}",
                ["contents" => [["parts" => [["text" => $batchPrompt]]]]]
            );
            if ($batchRes->successful()) {
                $raw = $batchRes->json()['candidates'][0]['content']['parts'][0]['text'] ?? '[]';
                $clean = preg_replace('/```json|```/', '', $raw);
                $decoded = json_decode(trim($clean), true);
                if (is_array($decoded))
                    $batchIntents = $decoded;
            }
        } catch (\Exception $e) {
            // fallback — will use defaults below
        }

        foreach ($messages as $idx => $msg) {
            $query = $msg->message;
            $userName = $msg->sender?->name ?? 'Unknown';
            $time = Carbon::parse($msg->created_at)->diffForHumans();
            $ai = $batchIntents[$idx] ?? [];
            $hasFailed = empty($batchIntents);

            $results[] = [
                'query' => $query,
                'user_name' => $userName,
                'topic' => $ai['topic'] ?? 'Uncategorized',
                'type' => $ai['type'] ?? ($hasFailed ? 'Uncategorized' : 'Other'),
                'intent' => $ai['intent'] ?? ($hasFailed ? 'Categorization failed. Please try again.' : '—'),
                'status' => $hasFailed ? 'failed' : 'categorized',
                'time' => $time,
            ];
        }
        // Build summary counts by topic
        $summary = collect($results)
            ->groupBy('topic')
            ->map(fn($g) => $g->count())
            ->sortDesc()
            ->toArray();

        return response()->json([
            'no_data' => false,
            'categorize_failed' => $failed,
            'results' => $results,
            'summary' => $summary,
            'total' => count($results),
        ]);
    }
}