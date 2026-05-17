    <?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;

    use App\Http\Controllers\FaqController;
    use App\Http\Controllers\ChatbotController;
    use App\Http\Controllers\ChatConversationController;
    use App\Http\Controllers\ChatMessageController;
    use App\Http\Controllers\UserComplaintController;
    use App\Http\Controllers\AdminComplaintController;

    //Faq routes
    Route::get('/faq', [FaqController::class, 'index']);
    Route::get('/faq/{id}', [FaqController::class, 'show']);
    Route::post('/faq', [FaqController::class, 'store']);
    Route::put('/faq/{id}', [FaqController::class, 'update']);
    Route::delete('/faq/{id}', [FaqController::class, 'destroy']);

    //Chatbot route
    Route::post('/chat', [ChatbotController::class, 'chat']);

    //Real Agent Chat conversation and message routes
    Route::post('/conversations', [ChatConversationController::class, 'store']);
    Route::get('/conversations', [ChatConversationController::class, 'index']);
    Route::get('/conversations/{id}', [ChatConversationController::class, 'show']);
    Route::post('/messages', [ChatMessageController::class, 'store']);
    Route::get('/messages/{conversationId}', [ChatMessageController::class, 'index']);
    Route::patch('/messages/{conversationId}/read', [ChatMessageController::class, 'markAsRead']);

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
