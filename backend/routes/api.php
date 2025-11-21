<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Work session routes
    Route::prefix('work-sessions')->group(function () {
        Route::post('/clock-in', [\App\Http\Controllers\Api\WorkSessionController::class, 'clockIn']);
        Route::post('/clock-out', [\App\Http\Controllers\Api\WorkSessionController::class, 'clockOut']);
        Route::get('/active', [\App\Http\Controllers\Api\WorkSessionController::class, 'getActive']);
        Route::get('/', [\App\Http\Controllers\Api\WorkSessionController::class, 'index']);
    });

    // Break routes
    Route::prefix('breaks')->group(function () {
        Route::post('/start', [\App\Http\Controllers\Api\BreakController::class, 'start']);
        Route::post('/end', [\App\Http\Controllers\Api\BreakController::class, 'end']);
    });
});

// Health check routes
Route::get('/ping', function() {
    return response()->json(['message' => 'pong'], 200);
});

Route::get('/health', function () {
    return response()->json([
        'ok'   => true,
        'time' => now(),
    ]);
});
