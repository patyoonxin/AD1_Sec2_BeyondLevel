    <?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;

    use App\Http\Controllers\FaqController;
    use App\Http\Controllers\ChatbotController;
    use App\Http\Controllers\ChatConversationController;
    use App\Http\Controllers\ChatMessageController;

    //Faq routes

    // UC029: View FAQ List
    Route::get('/faq', [FaqController::class, 'index']);
    
    // UC031: Search FAQ
    Route::get('/faq/search', [FaqController::class, 'search']);
    
    // UC030: View FAQ Details
    Route::get('/faq/{id}', [FaqController::class, 'show']);
    
    // FAQ categories
    Route::get('/faq-categories', [FaqController::class, 'categories']);
    
    // UC032: Admin FAQ Management
    Route::prefix('admin')->group(function () {
        Route::get('/faq',          [FaqController::class, 'adminIndex']);
        Route::post('/faq',         [FaqController::class, 'store']);
        Route::put('/faq/{id}',     [FaqController::class, 'update']);
        Route::delete('/faq/{id}',  [FaqController::class, 'destroy']);
    });

    //Chatbot route
    Route::post('/chat', [ChatbotController::class, 'chat']);

    //Real Agent Chat conversation and message routes
    Route::post('/conversations', [ChatConversationController::class, 'store']);
    Route::get('/conversations', [ChatConversationController::class, 'index']);
    Route::get('/conversations/{id}', [ChatConversationController::class, 'show']);
    Route::post('/messages', [ChatMessageController::class, 'store']);
    Route::get('/messages/{conversationId}', [ChatMessageController::class, 'index']);
    Route::patch('/messages/{conversationId}/read', [ChatMessageController::class, 'markAsRead']);
