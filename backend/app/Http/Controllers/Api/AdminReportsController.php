<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Team;
use App\Models\WorkSession;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportsController extends Controller
{
    /**
     * Dashboard overview statistics (Admin only)
     */
    public function overview()
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'supervisors' => User::where('role', 'supervisor')->count(),
                'employees' => User::where('role', 'employee')->count(),
            ],
            'teams' => [
                'total' => Team::count(),
            ],
            'work_sessions' => [
                'active' => WorkSession::whereNull('ended_at')->count(),
                'today' => WorkSession::whereDate('started_at', today())->count(),
            ],
            'leave_requests' => [
                'pending' => LeaveRequest::where('status', 'pending')->count(),
                'approved_this_month' => LeaveRequest::where('status', 'approved')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Work hours statistics (Admin only)
     */
    public function workHours(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        // Total hours by team
        $hoursByTeam = Team::select('teams.id', 'teams.name')
            ->leftJoin('users', 'teams.id', '=', 'users.team_id')
            ->leftJoin('work_sessions', 'users.id', '=', 'work_sessions.user_id')
            ->whereBetween('work_sessions.started_at', [$startDate, $endDate])
            ->whereNotNull('work_sessions.ended_at')
            ->groupBy('teams.id', 'teams.name')
            ->selectRaw('SUM(TIMESTAMPDIFF(SECOND, work_sessions.started_at, work_sessions.ended_at)) as total_seconds')
            ->get()
            ->map(function ($team) {
                $team->total_hours = round($team->total_seconds / 3600, 2);
                unset($team->total_seconds);
                return $team;
            });

        // Total hours by user (top 10)
        $hoursByUser = User::select('users.id', 'users.name', 'users.email')
            ->leftJoin('work_sessions', 'users.id', '=', 'work_sessions.user_id')
            ->whereBetween('work_sessions.started_at', [$startDate, $endDate])
            ->whereNotNull('work_sessions.ended_at')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->selectRaw('SUM(TIMESTAMPDIFF(SECOND, work_sessions.started_at, work_sessions.ended_at)) as total_seconds')
            ->orderByDesc('total_seconds')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                $user->total_hours = round($user->total_seconds / 3600, 2);
                unset($user->total_seconds);
                return $user;
            });

        return response()->json([
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'by_team' => $hoursByTeam,
            'top_users' => $hoursByUser,
        ]);
    }

    /**
     * Leave request statistics (Admin only)
     */
    public function leaveRequests()
    {
        $stats = [
            'by_status' => [
                'pending' => LeaveRequest::where('status', 'pending')->count(),
                'approved' => LeaveRequest::where('status', 'approved')->count(),
                'rejected' => LeaveRequest::where('status', 'rejected')->count(),
                'cancelled' => LeaveRequest::where('status', 'cancelled')->count(),
            ],
            'by_type' => [
                'vacation' => LeaveRequest::where('leave_type', 'vacation')->count(),
                'medical' => LeaveRequest::where('leave_type', 'medical')->count(),
                'personal' => LeaveRequest::where('leave_type', 'personal')->count(),
            ],
            'by_team' => Team::select('teams.id', 'teams.name')
                ->leftJoin('users', 'teams.id', '=', 'users.team_id')
                ->leftJoin('leave_requests', 'users.id', '=', 'leave_requests.user_id')
                ->groupBy('teams.id', 'teams.name')
                ->selectRaw('COUNT(leave_requests.id) as total_requests')
                ->get(),
        ];

        return response()->json($stats);
    }
}
