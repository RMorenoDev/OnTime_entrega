<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
use App\Models\WorkSession;
use Carbon\Carbon;

class WorkSessionSeeder extends Seeder
{
    public function run(): void
    {
        $employees = User::where('role', 'employee')->get();
        $supervisors = User::where('role', 'supervisor')->get();
        $allWorkers = $employees->merge($supervisors);

        $logisticaTeam = Team::where('name', 'Equipo Logística')->first();

        // Generar 2 meses de sesiones (60 dias hacia atras desde hoy)
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(60);

        foreach ($allWorkers as $user) {
            $currentDate = $startDate->copy();
            
            while ($currentDate->lte($endDate)) {
                // Saltar fines de semana
                if ($currentDate->isWeekend()) {
                    $currentDate->addDay();
                    continue;
                }

                // 90% de asistencia
                if (rand(1, 100) <= 90) {
                    $isSplitShift = ($user->team_id === $logisticaTeam->id);
                    
                    if ($isSplitShift) {
                        // Turno partido: 08:00-14:00 y 15:00-17:00
                        $clockInMorning = $currentDate->copy()->setHour(8)->setMinute(rand(0, 15));
                        $clockOutMorning = $currentDate->copy()->setHour(14)->setMinute(rand(0, 10));
                        
                        WorkSession::create([
                            'user_id' => $user->id,
                            'started_at' => $clockInMorning,
                            'ended_at' => $clockOutMorning
                        ]);

                        $clockInAfternoon = $currentDate->copy()->setHour(15)->setMinute(rand(0, 5));
                        $clockOutAfternoon = $currentDate->copy()->setHour(17)->setMinute(rand(0, 15));
                        
                        WorkSession::create([
                            'user_id' => $user->id,
                            'started_at' => $clockInAfternoon,
                            'ended_at' => $clockOutAfternoon
                        ]);
                    } else {
                        // Horario normal: 09:00-18:00 con variacion
                        $clockIn = $currentDate->copy()->setHour(9)->setMinute(rand(0, 20));
                        $clockOut = $currentDate->copy()->setHour(18)->setMinute(rand(0, 30));
                        
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
