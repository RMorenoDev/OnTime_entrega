<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    /**
     * Create a new leave request (Employee)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Validate request
        $validated = $request->validate([
            'leave_type' => 'required|in:vacation,medical,personal',
            'is_paid' => 'required|boolean',
            'is_full_day' => 'required|boolean',
            'duration_hours' => 'nullable|numeric|min:0.5|max:24',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'note' => 'required|string|max:1000',
        ]);

        // Validate duration_hours for partial day requests
        if (!$validated['is_full_day'] && !$request->duration_hours) {
            return response()->json([
                'message' => 'Duration in hours is required for partial day requests'
            ], 422);
        }

        // Validate duration_hours is in 0.5 hour blocks
        if (!$validated['is_full_day'] && fmod($request->duration_hours, 0.5) !== 0.0) {
            return response()->json([
                'message' => 'Duration must be in half-hour blocks (0.5, 1.0, 1.5, etc.)'
            ], 422);
        }

        // Check for overlapping leave requests
        $overlapping = LeaveRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('start_at', [$validated['start_at'], $validated['end_at'] ?? $validated['start_at']])
                    ->orWhereBetween('end_at', [$validated['start_at'], $validated['end_at'] ?? $validated['start_at']])
                    ->orWhere(function ($q) use ($validated) {
                        $q->where('start_at', '<=', $validated['start_at'])
                          ->where('end_at', '>=', $validated['end_at'] ?? $validated['start_at']);
                    });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'message' => 'You already have a leave request for this period'
            ], 422);
        }

        // Get supervisor from user's team
        // If user is a supervisor, their requests go to admin
        // If user is an employee, their requests go to their team's supervisor
        $supervisor_id = null;
        if ($user->role === 'supervisor') {
            // Find an admin user (CEO)
            $admin = \App\Models\User::where('role', 'admin')->first();
            $supervisor_id = $admin?->id;
        } else {
            $supervisor_id = $user->team?->supervisor_user_id;
        }

        // Create leave request
        $leaveRequest = LeaveRequest::create([
            'user_id' => $user->id,
            'supervisor_id' => $supervisor_id,
            'leave_type' => $validated['leave_type'],
            'is_paid' => $validated['is_paid'],
            'is_full_day' => $validated['is_full_day'],
            'duration_hours' => $validated['duration_hours'] ?? null,
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'] ?? null,
            'note' => $validated['note'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Leave request submitted successfully',
            'leave_request' => $leaveRequest->load(['user', 'supervisor'])
        ], 201);
    }

    /**
     * List user's own leave requests (Employee)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = LeaveRequest::where('user_id', $user->id)
            ->with(['supervisor']);

        // Filter by status if provided
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($leaveRequests);
    }

    /**
     * List pending leave requests for supervisor's team (Supervisor only)
     */
    public function pending(Request $request)
    {
        $user = Auth::user();

        // If user is admin, show all supervisor leave requests
        if ($user->role === 'admin') {
            $leaveRequests = LeaveRequest::whereHas('user', function ($query) {
                    $query->where('role', 'supervisor');
                })
                ->where('status', 'pending')
                ->with(['user'])
                ->orderBy('created_at', 'asc')
                ->get();
        } else {
            // If user is supervisor, show team members' requests (not other supervisors)
            $teamMembers = \App\Models\User::where('team_id', $user->team_id)
                ->where('id', '!=', $user->id) // Exclude supervisor themselves
                ->where('role', '!=', 'supervisor') // Exclude other supervisors
                ->pluck('id');

            $leaveRequests = LeaveRequest::whereIn('user_id', $teamMembers)
                ->where('status', 'pending')
                ->with(['user'])
                ->orderBy('created_at', 'asc')
                ->get();
        }

        return response()->json([
            'leave_requests' => $leaveRequests
        ]);
    }

    /**
     * List all employee leave requests (Admin only)
     */
    public function allEmployees(Request $request)
    {
        $user = Auth::user();

        // Only admins can see all employee requests
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied. Admin role required.'
            ], 403);
        }

        // Get all employee leave requests (exclude supervisors and admins)
        $leaveRequests = LeaveRequest::whereHas('user', function ($query) {
                $query->where('role', 'employee');
            })
            ->where('status', 'pending')
            ->with(['user'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'leave_requests' => $leaveRequests
        ]);
    }

    /**
     * Approve leave request (Supervisor and Admin)
     */
    public function approve(Request $request, $id)
    {
        $user = Auth::user();

        $leaveRequest = LeaveRequest::findOrFail($id);

        // Admins can approve any request
        // Supervisors can only approve requests from their team
        if ($user->role === 'supervisor') {
            if ($leaveRequest->user->team_id !== $user->team_id) {
                return response()->json([
                    'message' => 'You can only approve leave requests from your team'
                ], 403);
            }
        }

        // Verify status is pending
        if (!$leaveRequest->isPending()) {
            return response()->json([
                'message' => 'Only pending requests can be approved'
            ], 422);
        }

        $leaveRequest->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'supervisor_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Leave request approved successfully',
            'leave_request' => $leaveRequest->load(['user', 'supervisor'])
        ]);
    }

    /**
     * Reject leave request (Supervisor and Admin)
     */
    public function reject(Request $request, $id)
    {
        $user = Auth::user();

        $request->validate([
            'rejection_reason' => 'required|string|max:1000'
        ]);

        $leaveRequest = LeaveRequest::findOrFail($id);

        // Admins can reject any request
        // Supervisors can only reject requests from their team
        if ($user->role === 'supervisor') {
            if ($leaveRequest->user->team_id !== $user->team_id) {
                return response()->json([
                    'message' => 'You can only reject leave requests from your team'
                ], 403);
            }
        }

        // Verify status is pending
        if (!$leaveRequest->isPending()) {
            return response()->json([
                'message' => 'Only pending requests can be rejected'
            ], 422);
        }

        $leaveRequest->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'supervisor_id' => $user->id,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'message' => 'Leave request rejected',
            'leave_request' => $leaveRequest->load(['user', 'supervisor'])
        ]);
    }

    /**
     * Cancel own leave request (Employee)
     */
    public function cancel(Request $request, $id)
    {
        $user = Auth::user();

        $leaveRequest = LeaveRequest::findOrFail($id);

        // Verify the leave request belongs to the user
        if ($leaveRequest->user_id !== $user->id) {
            return response()->json([
                'message' => 'You can only cancel your own leave requests'
            ], 403);
        }

        // Verify status is pending or approved
        if (!in_array($leaveRequest->status, ['pending', 'approved'])) {
            return response()->json([
                'message' => 'Only pending or approved requests can be cancelled'
            ], 422);
        }

        $leaveRequest->update([
            'status' => 'cancelled'
        ]);

        return response()->json([
            'message' => 'Leave request cancelled successfully',
            'leave_request' => $leaveRequest
        ]);
    }
}
