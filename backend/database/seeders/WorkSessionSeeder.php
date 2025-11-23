<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\WorkSession;
use Carbon\Carbon;

class WorkSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all employees and supervisors
        $users = User::whereIn('role', ['employee', 'supervisor'])->get();

        // Generate sessions for the past 30 days
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(30);

        foreach ($users as $user) {
            $currentDate = $startDate->copy();

            while ($currentDate <= $endDate) {
                // Skip weekends
                if ($currentDate->isWeekday()) {
                    // 90% chance of working on a weekday (some absences)
                    if (rand(1, 100) <= 90) {
                        // Random clock-in time between 8:00 and 9:30 AM
                        $clockIn = $currentDate->copy()
                            ->setTime(8, 0)
                            ->addMinutes(rand(0, 90));

                        // Work duration between 7 and 9 hours
                        $workMinutes = rand(7 * 60, 9 * 60);
                        $clockOut = $clockIn->copy()->addMinutes($workMinutes);

                        WorkSession::create([
                            'user_id' => $user->id,
                            'started_at' => $clockIn,
                            'ended_at' => $clockOut
                        ]);
                    }
                }

                $currentDate->addDay();
            }
        }
    }
}
