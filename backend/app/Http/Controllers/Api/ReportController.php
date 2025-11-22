<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WorkSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get personal work hours report
     */
    public function myHours(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();

        // Validate date range (max 1 year)
        if ($startDate->diffInDays($endDate) > 365) {
            return response()->json([
                'message' => 'Date range cannot exceed 1 year'
            ], 400);
        }

        $sessions = WorkSession::where('user_id', $request->user()->id)
            ->whereBetween('clock_in', [$startDate, $endDate])
            ->whereNotNull('clock_out')
            ->with('breaks')
            ->orderBy('clock_in', 'desc')
            ->get();

        return response()->json([
            'sessions' => $this->formatSessions($sessions),
            'summary' => $this->calculateSummary($sessions),
            'break_summary' => $this->calculateBreakSummary($sessions)
        ]);
    }

    /**
     * Get team work hours report (supervisor only)
     */
    public function teamHours(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $user = $request->user();
        
        // Get supervisor's team
        $team = $user->supervisedTeam;
        if (!$team) {
            return response()->json([
                'message' => 'You are not assigned to supervise any team'
            ], 403);
        }

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();

        // Validate date range (max 1 year)
        if ($startDate->diffInDays($endDate) > 365) {
            return response()->json([
                'message' => 'Date range cannot exceed 1 year'
            ], 400);
        }

        // Get team members
        $teamMemberIds = $team->members()->pluck('users.id');

        // Filter by specific user if requested
        if ($request->user_id) {
            if (!$teamMemberIds->contains($request->user_id)) {
                return response()->json([
                    'message' => 'User is not in your team'
                ], 403);
            }
            $teamMemberIds = collect([$request->user_id]);
        }

        // Get work sessions for team members
        $teamMembers = [];
        foreach ($teamMemberIds as $memberId) {
            $memberUser = User::find($memberId);
            $sessions = WorkSession::where('user_id', $memberId)
                ->whereBetween('clock_in', [$startDate, $endDate])
                ->whereNotNull('clock_out')
                ->with('breaks')
                ->get();

            if ($sessions->count() > 0) {
                $summary = $this->calculateSummary($sessions);
                $teamMembers[] = [
                    'user' => [
                        'id' => $memberUser->id,
                        'name' => $memberUser->name,
                        'email' => $memberUser->email
                    ],
                    'total_hours' => $summary['total_hours'],
                    'net_hours' => $summary['net_hours'],
                    'days_worked' => $summary['days_worked'],
                    'avg_hours' => $summary['avg_hours_per_day'],
                    'sessions' => $this->formatSessions($sessions)
                ];
            }
        }

        // Sort by total hours descending
        usort($teamMembers, function($a, $b) {
            return $b['total_hours'] <=> $a['total_hours'];
        });

        // Calculate team summary
        $totalHours = array_sum(array_column($teamMembers, 'total_hours'));
        $avgHoursPerMember = count($teamMembers) > 0 ? $totalHours / count($teamMembers) : 0;

        return response()->json([
            'team_members' => $teamMembers,
            'team_summary' => [
                'total_hours' => round($totalHours, 2),
                'avg_hours_per_member' => round($avgHoursPerMember, 2),
                'members_count' => count($teamMembers)
            ]
        ]);
    }

    /**
     * Format sessions for response
     */
    private function formatSessions($sessions)
    {
        return $sessions->map(function ($session) {
            $clockIn = Carbon::parse($session->clock_in);
            $clockOut = Carbon::parse($session->clock_out);
            
            // Calculate total hours
            $totalMinutes = $clockIn->diffInMinutes($clockOut);
            $totalHours = $totalMinutes / 60;

            // Calculate break time
            $breakMinutes = $session->breaks->sum(function ($break) {
                if ($break->end_time) {
                    $start = Carbon::parse($break->start_time);
                    $end = Carbon::parse($break->end_time);
                    return $start->diffInMinutes($end);
                }
                return 0;
            });
            $breakHours = $breakMinutes / 60;

            // Net hours (total - breaks)
            $netHours = $totalHours - $breakHours;

            return [
                'id' => $session->id,
                'date' => $clockIn->format('Y-m-d'),
                'clock_in' => $clockIn->format('H:i:s'),
                'clock_out' => $clockOut->format('H:i:s'),
                'total_hours' => round($totalHours, 2),
                'break_time' => round($breakHours, 2),
                'net_hours' => round($netHours, 2),
                'breaks' => $session->breaks->map(function ($break) {
                    if ($break->end_time) {
                        $start = Carbon::parse($break->start_time);
                        $end = Carbon::parse($break->end_time);
                        $duration = $start->diffInMinutes($end) / 60;
                        return [
                            'type' => $break->break_type,
                            'duration' => round($duration, 2)
                        ];
                    }
                    return null;
                })->filter()->values()
            ];
        })->values();
    }

    /**
     * Calculate summary statistics
     */
    private function calculateSummary($sessions)
    {
        $totalHours = 0;
        $totalBreakTime = 0;
        $daysWorked = $sessions->count();

        foreach ($sessions as $session) {
            $clockIn = Carbon::parse($session->clock_in);
            $clockOut = Carbon::parse($session->clock_out);
            $totalHours += $clockIn->diffInMinutes($clockOut) / 60;

            // Calculate break time
            foreach ($session->breaks as $break) {
                if ($break->end_time) {
                    $start = Carbon::parse($break->start_time);
                    $end = Carbon::parse($break->end_time);
                    $totalBreakTime += $start->diffInMinutes($end) / 60;
                }
            }
        }

        $netHours = $totalHours - $totalBreakTime;
        $avgHoursPerDay = $daysWorked > 0 ? $totalHours / $daysWorked : 0;

        return [
            'total_hours' => round($totalHours, 2),
            'total_break_time' => round($totalBreakTime, 2),
            'net_hours' => round($netHours, 2),
            'days_worked' => $daysWorked,
            'avg_hours_per_day' => round($avgHoursPerDay, 2)
        ];
    }

    /**
     * Calculate break summary by type
     */
    private function calculateBreakSummary($sessions)
    {
        $breakSummary = [];

        foreach ($sessions as $session) {
            foreach ($session->breaks as $break) {
                if ($break->end_time) {
                    $type = $break->break_type;
                    $start = Carbon::parse($break->start_time);
                    $end = Carbon::parse($break->end_time);
                    $duration = $start->diffInMinutes($end) / 60;

                    if (!isset($breakSummary[$type])) {
                        $breakSummary[$type] = 0;
                    }
                    $breakSummary[$type] += $duration;
                }
            }
        }

        // Round all values
        foreach ($breakSummary as $type => $duration) {
            $breakSummary[$type] = round($duration, 2);
        }

        return $breakSummary;
    }
}
