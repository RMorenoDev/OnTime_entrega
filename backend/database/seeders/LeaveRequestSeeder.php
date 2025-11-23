<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\LeaveRequest;
use Carbon\Carbon;

class LeaveRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all employees and supervisors
        $users = User::whereIn('role', ['employee', 'supervisor'])->get();
        
        $leaveTypes = ['vacation', 'medical', 'personal'];
        $statuses = ['pending', 'approved', 'rejected'];

        foreach ($users as $user) {
            // Create 2-4 leave requests per user
            $numRequests = rand(2, 4);

            for ($i = 0; $i < $numRequests; $i++) {
                $type = $leaveTypes[array_rand($leaveTypes)];
                $status = $statuses[array_rand($statuses)];

                // Random dates (some past, some future)
                $daysOffset = rand(-30, 60);
                $startDate = Carbon::now()->addDays($daysOffset);
                $duration = rand(1, 5); // 1-5 days
                $endDate = $startDate->copy()->addDays($duration);

                $leaveRequest = LeaveRequest::create([
                    'user_id' => $user->id,
                    'leave_type' => $type,
                    'is_paid' => $type === 'vacation',
                    'is_full_day' => true,
                    'start_at' => $startDate,
                    'end_at' => $endDate,
                    'note' => $this->generateReason($type),
                    'status' => $status
                ]);

                // Add approval/rejection details for processed requests
                if ($status === 'approved' || $status === 'rejected') {
                    // Get a supervisor or admin to approve/reject
                    $approver = User::whereIn('role', ['supervisor', 'admin'])->inRandomOrder()->first();
                    
                    $leaveRequest->update([
                        'supervisor_id' => $approver->id,
                        'reviewed_at' => Carbon::now()->subDays(rand(1, 10)),
                        'rejection_reason' => $status === 'rejected' 
                            ? 'Due to team scheduling conflicts' 
                            : null
                    ]);
                }
            }
        }
    }

    /**
     * Generate realistic reason based on leave type
     */
    private function generateReason(string $type): string
    {
        return match($type) {
            'vacation' => collect([
                'Family vacation',
                'Personal travel',
                'Rest and relaxation',
                'Holiday trip'
            ])->random(),
            'medical' => collect([
                'Medical appointment',
                'Doctor visit',
                'Health checkup',
                'Medical treatment'
            ])->random(),
            'personal' => collect([
                'Personal matters',
                'Family emergency',
                'Personal appointment',
                'Family event'
            ])->random(),
            default => 'Leave request'
        };
    }
}
