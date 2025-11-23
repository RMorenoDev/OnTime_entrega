<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\LeaveRequest;
use Carbon\Carbon;

class LeaveRequestSeeder extends Seeder
{
    private function getSpanishReason($type): string
    {
        $reasons = [
            'vacation' => [
                'Vacaciones de verano planificadas',
                'Viaje familiar programado',
                'Días de descanso acumulados',
                'Vacaciones navideñas',
                'Puente festivo',
                'Asuntos personales y descanso',
            ],
            'medical' => [
                'Gripe estacional',
                'Cita médica especialista',
                'Revisión médica programada',
                'Malestar general',
                'Dolor de espalda',
                'Consulta odontológica',
            ],
            'personal' => [
                'Asuntos familiares urgentes',
                'Trámites administrativos',
                'Mudanza de domicilio',
                'Cita oficial',
                'Gestiones bancarias importantes',
                'Asuntos legales pendientes',
            ]
        ];

        return $reasons[$type][array_rand($reasons[$type])];
    }

    private function getSpanishRejectionReason(): string
    {
        $reasons = [
            'Falta de personal ese día',
            'Periodo de alta carga de trabajo',
            'Ya hay otro compañero de baja',
            'Necesitamos cubrir el puesto',
            'Solicitud tardía, insuficiente preaviso',
            'Conflicto con calendario laboral',
        ];

        return $reasons[array_rand($reasons)];
    }

    public function run(): void
    {
        $employees = User::where('role', 'employee')->get();
        $supervisors = User::where('role', 'supervisor')->get();

        $leaveTypes = ['vacation', 'medical', 'personal'];
        $statuses = ['pending', 'approved', 'rejected'];

        // Generar al menos 50 solicitudes
        $requestsToCreate = 60;
        $requestsCreated = 0;

        // Distribuir las solicitudes entre empleados
        foreach ($employees as $employee) {
            // Cada empleado tiene entre 2 y 5 solicitudes
            $numRequests = rand(2, 5);
            
            for ($i = 0; $i < $numRequests && $requestsCreated < $requestsToCreate; $i++) {
                $type = $leaveTypes[array_rand($leaveTypes)];
                $status = $statuses[array_rand($statuses)];
                
                // Generar fechas aleatorias en los últimos 60 días o futuros 30 días
                $daysOffset = rand(-60, 30);
                $startDate = Carbon::now()->addDays($daysOffset);
                
                // Duración: 1-5 días
                $duration = rand(1, 5);
                $endDate = $startDate->copy()->addDays($duration - 1);

                $leaveRequest = LeaveRequest::create([
                    'user_id' => $employee->id,
                    'leave_type' => $type,
                    'is_paid' => $type === 'vacation' || ($type === 'medical' && rand(1, 100) <= 70),
                    'is_full_day' => true,
                    'start_at' => $startDate,
                    'end_at' => $endDate,
                    'note' => $this->getSpanishReason($type),
                    'status' => $status
                ]);

                // Si está aprobada o rechazada, asignar supervisor
                if ($status === 'approved' || $status === 'rejected') {
                    // Buscar supervisor del equipo o admin
                    $approver = null;
                    if ($employee->team_id) {
                        $approver = User::where('team_id', $employee->team_id)
                            ->where('role', 'supervisor')
                            ->inRandomOrder()
                            ->first();
                    }
                    
                    if (!$approver) {
                        $approver = User::where('role', 'admin')->first();
                    }

                    $leaveRequest->update([
                        'supervisor_id' => $approver->id,
                        'reviewed_at' => Carbon::now()->subDays(rand(1, 15)),
                        'rejection_reason' => $status === 'rejected' 
                            ? $this->getSpanishRejectionReason()
                            : null
                    ]);
                }

                $requestsCreated++;
            }
        }

        // Añadir algunas solicitudes de supervisores también
        foreach ($supervisors as $supervisor) {
            if ($requestsCreated >= $requestsToCreate) break;

            $type = $leaveTypes[array_rand($leaveTypes)];
            $status = $statuses[array_rand($statuses)];
            
            $daysOffset = rand(-40, 20);
            $startDate = Carbon::now()->addDays($daysOffset);
            $duration = rand(1, 3);
            $endDate = $startDate->copy()->addDays($duration - 1);

            $leaveRequest = LeaveRequest::create([
                'user_id' => $supervisor->id,
                'leave_type' => $type,
                'is_paid' => true,
                'is_full_day' => true,
                'start_at' => $startDate,
                'end_at' => $endDate,
                'note' => $this->getSpanishReason($type),
                'status' => $status
            ]);

            if ($status === 'approved' || $status === 'rejected') {
                $admin = User::where('role', 'admin')->first();
                
                $leaveRequest->update([
                    'supervisor_id' => $admin->id,
                    'reviewed_at' => Carbon::now()->subDays(rand(1, 10)),
                    'rejection_reason' => $status === 'rejected' 
                        ? $this->getSpanishRejectionReason()
                        : null
                ]);
            }

            $requestsCreated++;
        }
    }
}
