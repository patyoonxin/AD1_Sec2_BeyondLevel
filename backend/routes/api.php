    <?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;

    use App\Http\Controllers\FaqController;
    use App\Http\Controllers\ChatbotController;
    use App\Http\Controllers\ChatConversationController;
    use App\Http\Controllers\ChatMessageController;
    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\ProfileController;
    use App\Http\Controllers\AdminUserController;


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

    //Auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

    //Profile routes
    Route::middleware('auth:sanctum')->get('/profile', function (Request $request) {return response()->json($request->user());});
    Route::middleware('auth:sanctum')->put('/profile', [ProfileController::class, 'updateProfile']);
    Route::middleware('auth:sanctum')->put('/profile/email', [ProfileController::class, 'updateEmail']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);

    //Admin user routes
    Route::put('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']);
