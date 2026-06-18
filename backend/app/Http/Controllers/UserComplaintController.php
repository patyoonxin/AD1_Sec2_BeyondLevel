<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Log;

class UserComplaintController extends Controller
{
    /**
     * Store a newly submitted complaint.
     *
     * Validates the incoming request, generates a unique Record ID,
     * calls the Gemini API to forecast a category, stores any uploaded
     * attachments, and persists the complaint to the database.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        | description : required, at least 10 chars to ensure sufficient detail.
        | location    : required, max 255 chars.
        | attachments : optional, array of image files (max 2MB each).
        */
        $validated = $request->validate([
            'user_id'     => ['required', 'integer', 'exists:users,id'],
            'title'       => ['required', 'string', 'max:255'],
            'category'    => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'min:5'],
            'location'    => ['required', 'string', 'max:255'],
            // Support both a single 'attachment' file (current frontend) and 'attachments[]'
            'attachment'    => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:5120'],
            'attachments'   => ['nullable', 'array'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:5120'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Generate Unique Record ID
        |--------------------------------------------------------------------------
        | Format: CMP-YYYYMMDD-XXXX where XXXX is a zero-padded random number.
        | This provides a human-friendly reference for users and admins.
        */
        $datePart = now()->format('Ymd');
        $randomPart = strtoupper(substr(uniqid(), -4));
        $recordId = "CMP-{$datePart}-{$randomPart}";

        // Ensure uniqueness in the unlikely case of collision
        while (Complaint::where('record_id', $recordId)->exists()) {
            $randomPart = strtoupper(substr(uniqid(), -4));
            $recordId = "CMP-{$datePart}-{$randomPart}";
        }

        /*
        |--------------------------------------------------------------------------
        | Handle Attachments
        |--------------------------------------------------------------------------
        | Each uploaded file is stored in the 'public/complaints' disk directory.
        | The public URL is saved so the frontend can display them directly.
        */
        $attachmentUrls = [];

        // Single-file field used by the React form
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('complaints', 'public');
            $attachmentUrls[] = Storage::url($path);
        }

        // Multi-file field (for future use)
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('complaints', 'public');
                $attachmentUrls[] = Storage::url($path);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Persist Complaint
        |--------------------------------------------------------------------------
        | Associates the complaint with the currently authenticated user.
        | The category is the user-selected value from the dynamic categories.
        */
        $categoryModel = \App\Models\ComplaintCategory::where('name', $validated['category'])->first();

        $complaint = Complaint::create([
            'record_id'    => $recordId,
            'user_id'      => $validated['user_id'],
            'title'        => $validated['title'],
            'category'     => $validated['category'],
            'category_id'  => $categoryModel?->id,
            'description'  => $validated['description'],
            'location'     => $validated['location'],
            'attachments'  => $attachmentUrls,
            'status'       => 'Pending',
        ]);

        return response()->json([
            'message'    => 'Complaint submitted successfully.',
            'complaint'  => $complaint->load('user'),
        ], 201);
    }

    /**
     * Display the complaint history for the authenticated user.
     *
     * Returns a paginated list of all complaints submitted by the
     * currently logged-in user, ordered by newest first.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        /*
        | Accept user_id either from query (?user_id=1) or from authenticated user.
        | This keeps compatibility with the current localStorage-based auth flow.
        */
        $userId = $request->query('user_id') ?? optional($request->user())->id;

        if (! $userId) {
            return response()->json(['message' => 'user_id is required.'], 422);
        }

        $complaints = Complaint::with(['responses.admin'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($complaints);
    }

    /**
     * Display the full details of a specific complaint.
     *
     * Ensures the authenticated user can only view their own complaints
     * to prevent unauthorized access to other users' data.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $query = Complaint::with(['user', 'responses.admin'])->where('id', $id);

        // Optional ownership check when user_id is supplied
        if ($userId = $request->query('user_id') ?? optional($request->user())->id) {
            $query->where('user_id', $userId);
        }

        $complaint = $query->firstOrFail();

        return response()->json($complaint);
    }

    /**
     * Search the authenticated user's complaint records.
     *
     * Filters complaints by record_id, status, ai_category, or keywords
     * found in the description. Only searches within the current user's data.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $userId = $request->query('user_id') ?? optional($request->user())->id;

        if (! $userId) {
            return response()->json(['message' => 'user_id is required.'], 422);
        }

        $query = Complaint::where('user_id', $userId);

        /*
        |--------------------------------------------------------------------------
        | Apply Search Filters
        |--------------------------------------------------------------------------
        | q       : general search across record_id, description, and location.
        | status  : exact match on complaint status.
        | category: exact match on complaint category.
        */
        if ($request->filled('q')) {
            $searchTerm = $request->input('q');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('record_id', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('location', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $query->where('ai_category', $request->input('category'));
        }

        $complaints = $query->orderBy('created_at', 'desc')->get();

        return response()->json($complaints);
    }

    /**
     * Suggest a complaint category using the Gemini AI service.
     *
     * Accepts a complaint description and returns the predicted category.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function suggestCategory(Request $request): JsonResponse
    {
        $request->validate([
            'description' => ['required', 'string', 'min:10'],
        ]);

        // Verify the Gemini API key is configured
        if (empty(env('GEMINI_API_KEY'))) {
            return response()->json([
                'message' => 'AI categorisation service is not configured.',
            ], 503);
        }

        try {
            $gemini = new GeminiService();
            $categoryNames = $request->input('categories', []);
            $category = $gemini->categorizeComplaint($request->input('description'), $categoryNames);

            return response()->json(['category' => $category]);
        } catch (\Throwable $e) {
            Log::error('Gemini suggestCategory failed: ' . $e->getMessage());
            $isRateLimit = str_contains($e->getMessage(), 'rate limit');
            return response()->json([
                'message' => $isRateLimit
                    ? 'Rate limit reached. Please wait a moment and try again.'
                    : 'AI categorisation service unavailable.',
                'debug'   => $e->getMessage(),
            ], 503);
        }
    }
}
