<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\FaqController;
use App\Http\Controllers\ChatbotController;

//Faq routes
Route::get('/faq', [FaqController::class, 'index']);
Route::get('/faq/{id}', [FaqController::class, 'show']);
Route::post('/faq', [FaqController::class, 'store']);
Route::put('/faq/{id}', [FaqController::class, 'update']);
Route::delete('/faq/{id}', [FaqController::class, 'destroy']);

//Chatbot route
Route::post('/chat', [ChatbotController::class, 'chat']);

