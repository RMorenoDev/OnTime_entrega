<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkBreak;
use App\Models\WorkSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BreakController extends Controller
{
    /**
     * Start a break
     */
    public function start(Request $request)
    {
        $user = Auth::user();

        // Validate request
        $request->validate([
            'break_type' => 'required|in:coffee,lunch,personal,medical',
            'is_paid' => 'required|boolean',
            'note' => 'nullable|string|max:255',
        ]);

        // Check if user has an active work session
        $activeSession = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        if (!$activeSession) {
            return response()->json([
                'message' => 'No active work session found. Please clock in first.'
            ], 422);
        }

        // Check if user already has an active break
        $activeBreak = WorkBreak::where('work_session_id', $activeSession->id)
            ->whereNull('ended_at')
            ->first();

        if ($activeBreak) {
            return response()->json([
                'message' => 'You already have an active break',
                'break' => $activeBreak
            ], 422);
        }

        // Create new break
        $break = WorkBreak::create([
            'work_session_id' => $activeSession->id,
            'break_type' => $request->break_type,
            'is_paid' => $request->is_paid,
            'started_at' => now(),
            'note' => $request->note,
        ]);

        return response()->json([
            'message' => 'Break started successfully',
            'break' => $break
        ], 201);
    }

    /**
     * End current break
     */
    public function end(Request $request)
    {
        $user = Auth::user();

        // Find user's active work session
        $activeSession = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        if (!$activeSession) {
            return response()->json([
                'message' => 'No active work session found'
            ], 404);
        }

        // Find active break
        $break = WorkBreak::where('work_session_id', $activeSession->id)
            ->whereNull('ended_at')
            ->first();

        if (!$break) {
            return response()->json([
                'message' => 'No active break found'
            ], 404);
        }

        // End break
        $break->update([
            'ended_at' => now(),
            'note' => $request->note ?? $break->note,
        ]);

        return response()->json([
            'message' => 'Break ended successfully',
            'break' => $break
        ]);
    }
}
