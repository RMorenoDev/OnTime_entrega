<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkSession;
use App\Models\WorkBreak;
use Carbon\Carbon;

class BreakSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $breakTypes = ['Coffee', 'Lunch', 'Snack', 'Personal'];
        
        // Get all work sessions
        $sessions = WorkSession::all();

        foreach ($sessions as $session) {
            $sessionStart = Carbon::parse($session->started_at);
            $sessionEnd = Carbon::parse($session->ended_at);
            $sessionDuration = $sessionStart->diffInHours($sessionEnd);

            // Number of breaks based on session duration
            $numBreaks = $sessionDuration >= 8 ? rand(2, 3) : rand(1, 2);

            $currentTime = $sessionStart->copy()->addHours(2); // Start breaks after 2 hours

            for ($i = 0; $i < $numBreaks; $i++) {
                // Ensure we don't exceed session end time
                if ($currentTime->greaterThanOrEqualTo($sessionEnd->copy()->subHour())) {
                    break;
                }

                $breakType = $breakTypes[array_rand($breakTypes)];
                
                // Break duration based on type
                $breakDuration = match($breakType) {
                    'Lunch' => rand(30, 60),
                    'Coffee' => rand(10, 20),
                    'Snack' => rand(10, 15),
                    'Personal' => rand(5, 20),
                    default => rand(10, 30)
                };

                $breakStart = $currentTime->copy();
                $breakEnd = $breakStart->copy()->addMinutes($breakDuration);

                WorkBreak::create([
                    'work_session_id' => $session->id,
                    'break_type' => $breakType,
                    'started_at' => $breakStart,
                    'ended_at' => $breakEnd,
                    'is_paid' => in_array($breakType, ['Coffee', 'Snack']) // Coffee and snacks are paid
                ]);

                // Move current time forward for next break (spacing breaks apart)
                $currentTime->addMinutes($breakDuration + rand(60, 120));
            }
        }
    }
}
