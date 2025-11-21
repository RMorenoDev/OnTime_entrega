<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkSessionController extends Controller
{
    /**
     * Clock in - Start a new work session
     */
    public function clockIn(Request $request)
    {
        $user = Auth::user();

        // Check if user already has an active work session
        $activeSession = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        if ($activeSession) {
            return response()->json([
                'message' => 'You already have an active work session',
                'session' => $activeSession
            ], 422);
        }

        // Create new work session
        $session = WorkSession::create([
            'user_id' => $user->id,
            'started_at' => now(),
            'source' => 'employee',
            'note' => $request->note,
        ]);

        return response()->json([
            'message' => 'Clocked in successfully',
            'session' => $session->load('breaks')
        ], 201);
    }

    /**
     * Clock out - End current work session
     */
    public function clockOut(Request $request)
    {
        $user = Auth::user();

        // Find active work session
        $session = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'No active work session found'
            ], 404);
        }

        // End any active breaks first
        $activeBreak = $session->breaks()->whereNull('ended_at')->first();
        if ($activeBreak) {
            $activeBreak->update(['ended_at' => now()]);
        }

        // End work session
        $session->update([
            'ended_at' => now(),
            'note' => $request->note ?? $session->note,
        ]);

        return response()->json([
            'message' => 'Clocked out successfully',
            'session' => $session->load('breaks')
        ]);
    }

    /**
     * Get active work session
     */
    public function getActive()
    {
        $user = Auth::user();

        $session = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->with(['breaks' => function ($query) {
                $query->orderBy('started_at', 'asc');
            }])
            ->first();

        return response()->json([
            'session' => $session
        ]);
    }

    /**
     * List user's work sessions
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $sessions = WorkSession::where('user_id', $user->id)
            ->with('breaks')
            ->orderBy('started_at', 'desc')
            ->paginate(20);

        return response()->json($sessions);
    }
}
