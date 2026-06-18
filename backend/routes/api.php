<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;

use App\Http\Controllers\FaqController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ChatConversationController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\UserComplaintController;
use App\Http\Controllers\AdminComplaintController;
use App\Http\Controllers\ComplaintCategoryController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\AdminProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ChatbotAnalyticsController;

/*
|--------------------------------------------------------------------------
| FAQ Routes
|--------------------------------------------------------------------------
*/

// UC029: View FAQ List
Route::get('/faq', [FaqController::class, 'index']);

// UC031: Search FAQ (must be registered before /faq/{id})
Route::get('/faq/search', [FaqController::class, 'search']);

// UC030: View FAQ Details
Route::get('/faq/{id}', [FaqController::class, 'show']);

// FAQ categories
Route::get('/faq-categories', [FaqController::class, 'categories']);

// UC032: Admin FAQ Management
Route::prefix('admin')->group(function () {
    Route::get('/faq',         [FaqController::class, 'adminIndex']);
    Route::post('/faq',        [FaqController::class, 'store']);
    Route::put('/faq/{id}',    [FaqController::class, 'update']);
    Route::delete('/faq/{id}', [FaqController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Chatbot Route
|--------------------------------------------------------------------------
*/
Route::post('/chat', [ChatbotController::class, 'chat']);

/*
|--------------------------------------------------------------------------
| Real Agent Chat — Conversation & Message Routes
|--------------------------------------------------------------------------
*/
Route::post('/conversations', [ChatConversationController::class, 'store']);
Route::get('/conversations', [ChatConversationController::class, 'index']);
Route::get('/conversations/has/{userId}', [ChatConversationController::class, 'hasConversation']);
Route::get('/conversations/{id}', [ChatConversationController::class, 'show']);

Route::post('/messages', [ChatMessageController::class, 'store']);
Route::get('/messages/{conversationId}', [ChatMessageController::class, 'index']);
Route::patch('/messages/{conversationId}/read', [ChatMessageController::class, 'markAsRead']);

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

Route::post('auth/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('auth/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Profile Routes (Authenticated User)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', function (Request $request) {
        return response()->json($request->user());
    });
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/profile/email', [ProfileController::class, 'updateEmail']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
});

/*
|--------------------------------------------------------------------------
| Admin Profile Routes
|--------------------------------------------------------------------------
| NOTE: the original file defined GET /admin/profile twice (once open,
| once behind auth:sanctum, pointing to two different methods —
| 'show' and 'getProfile'). Since a logged-in admin viewing their own
| profile should always be authenticated, this has been merged into a
| single protected route using 'show'. Adjust the method name back to
| 'getProfile' here if that was actually the intended controller method.
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/profile', [AdminProfileController::class, 'show']);
    Route::put('/admin/profile', [AdminProfileController::class, 'update']);
    Route::post('/admin/change-password', [AdminProfileController::class, 'changePassword']);
});

/*
|--------------------------------------------------------------------------
| Admin User Management Routes
|--------------------------------------------------------------------------
| NOTE: the original file exposed the same CRUD twice — once under
| /admin/users with no auth middleware, and again under /users behind
| auth:sanctum (plus a stray unprotected POST /admin/users for store).
| Merged into one consistent, authenticated set of routes under
| /admin/users.
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AdminUserController::class, 'me']);

    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::patch('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// Dashboard: latest registered users & latest FAQ updates
Route::get('/admin/users/latest', function () {
    $users = User::where('role', 'user')
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get(['id', 'name', 'email', 'created_at']);
    return response()->json($users);
});

Route::get('/admin/faq/latest', function () {
    $faqs = \App\Models\Faq::orderBy('updated_at', 'desc')
        ->limit(5)
        ->get(['id', 'question', 'category', 'updated_at']);
    return response()->json($faqs);
});

/*
|--------------------------------------------------------------------------
| Complaint Management Subsystem
|--------------------------------------------------------------------------
| Portal Rasmi Pejabat Daerah Kulai — Complaint Management API Routes
|
| User-facing routes are protected by authentication (sanctum recommended).
| Admin-facing routes are additionally protected by the 'admin' middleware
| to ensure only administrators can manage and respond to complaints.
*/

/*
|--------------------------------------------------------------------------
| User Routes (Authenticated)
|--------------------------------------------------------------------------
| These endpoints allow registered users to submit, view, and search
| their own complaints. The auth middleware ensures only logged-in
| users can access these resources.
*/
Route::prefix('complaints')->group(function () {

    // Submit a new complaint with attachments
    Route::post('/', [UserComplaintController::class, 'store']);

    // List the authenticated user's complaint history
    Route::get('/', [UserComplaintController::class, 'index']);

    // Search and filter the authenticated user's complaints
    Route::get('/search', [UserComplaintController::class, 'search']);

    // AI-powered category suggestion using Gemini
    Route::post('/suggest-category', [UserComplaintController::class, 'suggestCategory']);

    // View full details of a specific user-owned complaint
    Route::get('/{id}', [UserComplaintController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Authenticated + Admin Role)
|--------------------------------------------------------------------------
| These endpoints allow administrators to view all complaints,
| search across the entire system, respond to complaints, and
| update the progress status of any record.
*/
Route::prefix('admin/complaints')->group(function () {

    // View paginated list of all complaints
    Route::get('/', [AdminComplaintController::class, 'index']);

    // Search across all complaints with advanced filters
    Route::get('/search', [AdminComplaintController::class, 'search']);

    // View full details of any complaint
    Route::get('/{id}', [AdminComplaintController::class, 'show']);

    // Submit an official admin response to a complaint
    Route::post('/{id}/respond', [AdminComplaintController::class, 'respond']);

    // Update the status of a complaint
    Route::patch('/{id}/status', [AdminComplaintController::class, 'updateStatus']);
});

/*
|--------------------------------------------------------------------------
| Complaint Category Routes
|--------------------------------------------------------------------------
| Public endpoint to fetch active categories for the user form.
| Admin endpoints for full CRUD management of dynamic categories.
*/
Route::get('/complaint-categories/active', [ComplaintCategoryController::class, 'active']);

Route::prefix('admin/complaint-categories')->group(function () {
    Route::get('/', [ComplaintCategoryController::class, 'index']);
    Route::post('/', [ComplaintCategoryController::class, 'store']);
    Route::get('/{id}', [ComplaintCategoryController::class, 'show']);
    Route::put('/{id}', [ComplaintCategoryController::class, 'update']);
    Route::delete('/{id}', [ComplaintCategoryController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Analytics & Reports Routes (UC027, UC028)
|--------------------------------------------------------------------------
| UC027 Generate Analytics Report : GET  /api/admin/analytics/generate
| UC028 Export Analytics Report   : POST /api/admin/analytics/export
| Summary stats for dashboard     : GET  /api/admin/analytics/summary
*/
Route::prefix('admin/analytics')->group(function () {
    Route::get('/summary', [AnalyticsController::class, 'summary']);
    Route::get('/generate', [AnalyticsController::class, 'generate']);
    Route::post('/export', [AnalyticsController::class, 'export']);
});

/*
|--------------------------------------------------------------------------
| Chatbot Analytics Routes (UC022)
|--------------------------------------------------------------------------
| UC022 Analyze Chatbot Interactions : GET /api/admin/chatbot/analyze
*/
Route::get('/admin/chatbot/analyze', [ChatbotAnalyticsController::class, 'analyze']);
Route::get('/admin/chatbot/interpret', [ChatbotAnalyticsController::class, 'interpretQueries']);
Route::get('/admin/chatbot/categorize', [ChatbotAnalyticsController::class, 'categorizeQueries']);
Route::post('/admin/chatbot/generate-faq', [ChatbotAnalyticsController::class, 'generateFaqFromConversations']);
Route::post('/admin/chatbot/save-faq', [ChatbotAnalyticsController::class, 'saveSelectedFaq']);