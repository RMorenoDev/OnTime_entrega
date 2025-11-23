<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public teams list for registration
Route::get('/teams', [\App\Http\Controllers\Api\TeamManagementController::class, 'index']);

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

    // Leave request routes (Employee)
    Route::prefix('leave-requests')->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\LeaveRequestController::class, 'store']);
        Route::get('/', [\App\Http\Controllers\Api\LeaveRequestController::class, 'index']);
        Route::put('/{id}/cancel', [\App\Http\Controllers\Api\LeaveRequestController::class, 'cancel']);
        
        // Supervisor and Admin routes
        Route::get('/pending', [\App\Http\Controllers\Api\LeaveRequestController::class, 'pending'])->middleware('supervisor');
        Route::get('/all-employees', [\App\Http\Controllers\Api\LeaveRequestController::class, 'allEmployees'])->middleware('supervisor');
        Route::put('/{id}/approve', [\App\Http\Controllers\Api\LeaveRequestController::class, 'approve'])->middleware('supervisor');
        Route::put('/{id}/reject', [\App\Http\Controllers\Api\LeaveRequestController::class, 'reject'])->middleware('supervisor');
    });

    // Reports routes
    Route::prefix('reports')->group(function () {
        Route::get('/my-hours', [\App\Http\Controllers\Api\ReportController::class, 'myHours']);
        Route::get('/team-hours', [\App\Http\Controllers\Api\ReportController::class, 'teamHours'])->middleware('supervisor');
    });

    // Admin-only routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // User management
        Route::get('/users', [\App\Http\Controllers\Api\UserManagementController::class, 'index']);
        Route::get('/users/{id}', [\App\Http\Controllers\Api\UserManagementController::class, 'show']);
        Route::put('/users/{id}', [\App\Http\Controllers\Api\UserManagementController::class, 'update']);
        Route::put('/users/{id}/assign-team', [\App\Http\Controllers\Api\UserManagementController::class, 'assignTeam']);
        Route::put('/users/{id}/change-role', [\App\Http\Controllers\Api\UserManagementController::class, 'changeRole']);
        Route::delete('/users/{id}', [\App\Http\Controllers\Api\UserManagementController::class, 'destroy']);

        // Team management
        Route::get('/teams', [\App\Http\Controllers\Api\TeamManagementController::class, 'index']);
        Route::post('/teams', [\App\Http\Controllers\Api\TeamManagementController::class, 'store']);
        Route::put('/teams/{id}', [\App\Http\Controllers\Api\TeamManagementController::class, 'update']);
        Route::delete('/teams/{id}', [\App\Http\Controllers\Api\TeamManagementController::class, 'destroy']);
        Route::get('/teams/{id}/members', [\App\Http\Controllers\Api\TeamManagementController::class, 'members']);

        // Statistics
        Route::get('/stats/overview', [\App\Http\Controllers\Api\AdminReportsController::class, 'overview']);
        Route::get('/stats/work-hours', [\App\Http\Controllers\Api\AdminReportsController::class, 'workHours']);
        Route::get('/stats/leave-requests', [\App\Http\Controllers\Api\AdminReportsController::class, 'leaveRequests']);
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
