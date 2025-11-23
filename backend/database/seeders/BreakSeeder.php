<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkSession;
use App\Models\WorkBreak;
use App\Models\Team;
use Carbon\Carbon;

class BreakSeeder extends Seeder
{
    // Genera pausas de ejemplo para las sesiones existentes
    public function run(): void
    {
        $sessions = WorkSession::with('user.team')->get();
        $logisticaTeam = Team::where('name', 'Equipo Logística')->first();

        foreach ($sessions as $session) {
            $clockIn = Carbon::parse($session->started_at);
            $clockOut = Carbon::parse($session->ended_at);
            $isSplitShift = ($session->user->team_id === $logisticaTeam->id);

            // Sesiones de turno partido (manana o tarde)
            if ($isSplitShift) {
                $sessionDuration = $clockIn->diffInHours($clockOut);
                
                if ($sessionDuration >= 5) {
                    // Sesion de manana (08:00-14:00) - break de 30 min pagado
                    $breakStart = $clockIn->copy()->addHours(3)->addMinutes(rand(0, 30));
                    $breakEnd = $breakStart->copy()->addMinutes(30); // 30 minutos pagados
                    
                    WorkBreak::create([
                        'work_session_id' => $session->id,
                        'break_type' => 'Café',
                        'started_at' => $breakStart,
                        'ended_at' => $breakEnd,
                        'is_paid' => true
                    ]);
                } elseif ($sessionDuration >= 1.5) {
                    // Sesion de tarde (15:00-17:00) - break corto
                    if (rand(1, 100) <= 60) {
                        $breakStart = $clockIn->copy()->addMinutes(45);
                        $breakEnd = $breakStart->copy()->addMinutes(10);
                        
                        WorkBreak::create([
                            'work_session_id' => $session->id,
                        'break_type' => 'Café',
                            'started_at' => $breakStart,
                            'ended_at' => $breakEnd,
                            'is_paid' => true
                        ]);
                    }
                }
            } else {
                // Horario normal: siempre tienen 30 min de break pagado
                $breaks = [];
                
                // Break de cafe por la manana (30 min pagado)
                $morningBreak = $clockIn->copy()->addHours(2)->addMinutes(rand(0, 30));
                $breaks[] = [
                    'type' => 'Café',
                    'start' => $morningBreak,
                    'duration' => 30,
                    'is_paid' => true
                ];

                // Comida (30-60 min, los primeros 30 pagados)
                if (rand(1, 100) <= 85) {
                    $lunchBreak = $clockIn->copy()->addHours(4)->addMinutes(rand(0, 30));
                    $lunchDuration = rand(30, 60);
                    $breaks[] = [
                        'type' => 'Comida',
                        'start' => $lunchBreak,
                        'duration' => $lunchDuration,
                        'is_paid' => $lunchDuration <= 30 // Solo los primeros 30 min son pagados
                    ];
                }

                // Break de tarde ocasional
                if (rand(1, 100) <= 40) {
                    $afternoonBreak = $clockIn->copy()->addHours(6)->addMinutes(rand(0, 30));
                    $breaks[] = [
                        'type' => 'Café',
                        'start' => $afternoonBreak,
                        'duration' => 10,
                        'is_paid' => true
                    ];
                }

                foreach ($breaks as $breakData) {
                    $breakStart = $breakData['start'];
                    $breakEnd = $breakStart->copy()->addMinutes($breakData['duration']);
                    
                    // Asegurar que la pausa no exceda la sesion
                    if ($breakEnd->lte($clockOut)) {
                        WorkBreak::create([
                            'work_session_id' => $session->id,
                            'break_type' => $breakData['type'],
                            'started_at' => $breakStart,
                            'ended_at' => $breakEnd,
                            'is_paid' => $breakData['is_paid']
                        ]);
                    }
                }
            }
        }
    }
}
