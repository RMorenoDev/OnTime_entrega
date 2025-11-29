<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Crea admin, supervisores y empleados de ejemplo con equipos asignados
        User::create([
            'name' => 'Ramón Moreno',
            'email' => 'admin@ontimeapp.es',
            'password_hash' => Hash::make('passwordPI'),
            'role' => 'admin',
            'team_id' => null
        ]);

        $comercialTeam = Team::where('name', 'Equipo Comercial')->first();
        $tecnicoTeam = Team::where('name', 'Equipo Técnico')->first();
        $logisticaTeam = Team::where('name', 'Equipo Logística')->first();

        // Supervisores
        $supervisor1 = User::create([
            'name' => 'Ana García',
            'email' => 'supervisor1@ontimeapp.es',
            'password_hash' => Hash::make('passwordPI'),
            'role' => 'supervisor',
            'team_id' => $comercialTeam->id
        ]);

        // Equipo Tecnico tiene 2 supervisores
        $supervisor2 = User::create([
            'name' => 'Luis Fernández',
            'email' => 'supervisor2@ontimeapp.es',
            'password_hash' => Hash::make('passwordPI'),
            'role' => 'supervisor',
            'team_id' => $tecnicoTeam->id
        ]);

        $supervisor3 = User::create([
            'name' => 'María López',
            'email' => 'supervisor3@ontimeapp.es',
            'password_hash' => Hash::make('passwordPI'),
            'role' => 'supervisor',
            'team_id' => $tecnicoTeam->id
        ]);

        $supervisor4 = User::create([
            'name' => 'Javier Sánchez',
            'email' => 'supervisor4@ontimeapp.es',
            'password_hash' => Hash::make('passwordPI'),
            'role' => 'supervisor',
            'team_id' => $logisticaTeam->id
        ]);

        // Asignar supervisores a equipos
        $comercialTeam->supervisor_user_id = $supervisor1->id;
        $comercialTeam->save();

        $tecnicoTeam->supervisor_user_id = $supervisor2->id;
        $tecnicoTeam->save();

        $logisticaTeam->supervisor_user_id = $supervisor4->id;
        $logisticaTeam->save();

        // Empleados distribuidos en los 3 equipos
        $employees = [
            // Equipo Comercial (5 empleados)
            ['name' => 'Pedro Ruiz', 'email' => 'empleado1@ontimeapp.es', 'team_id' => $comercialTeam->id],
            ['name' => 'Laura Jiménez', 'email' => 'empleado2@ontimeapp.es', 'team_id' => $comercialTeam->id],
            ['name' => 'David Torres', 'email' => 'david.torres@ontimeapp.es', 'team_id' => $comercialTeam->id],
            ['name' => 'Carmen Ramírez', 'email' => 'carmen.ramirez@ontimeapp.es', 'team_id' => $comercialTeam->id],
            ['name' => 'Miguel Moreno', 'email' => 'miguel.moreno@ontimeapp.es', 'team_id' => $comercialTeam->id],
            
            // Equipo Tecnico (5 empleados)
            ['name' => 'Elena Navarro', 'email' => 'elena.navarro@ontimeapp.es', 'team_id' => $tecnicoTeam->id],
            ['name' => 'Roberto Díaz', 'email' => 'roberto.diaz@ontimeapp.es', 'team_id' => $tecnicoTeam->id],
            ['name' => 'Isabel Romero', 'email' => 'isabel.romero@ontimeapp.es', 'team_id' => $tecnicoTeam->id],
            ['name' => 'Francisco Gil', 'email' => 'francisco.gil@ontimeapp.es', 'team_id' => $tecnicoTeam->id],
            ['name' => 'Beatriz Muñoz', 'email' => 'beatriz.munoz@ontimeapp.es', 'team_id' => $tecnicoTeam->id],
            
            // Equipo Logistica (5 empleados) - Turno partido
            ['name' => 'Antonio Álvarez', 'email' => 'antonio.alvarez@ontimeapp.es', 'team_id' => $logisticaTeam->id],
            ['name' => 'Rosa Serrano', 'email' => 'rosa.serrano@ontimeapp.es', 'team_id' => $logisticaTeam->id],
            ['name' => 'José Blanco', 'email' => 'jose.blanco@ontimeapp.es', 'team_id' => $logisticaTeam->id],
            ['name' => 'Teresa Castro', 'email' => 'teresa.castro@ontimeapp.es', 'team_id' => $logisticaTeam->id],
            ['name' => 'Manuel Ortega', 'email' => 'manuel.ortega@ontimeapp.es', 'team_id' => $logisticaTeam->id],
        ];

        foreach ($employees as $employeeData) {
            User::create([
                'name' => $employeeData['name'],
                'email' => $employeeData['email'],
                'password_hash' => Hash::make('passwordPI'),
                'role' => 'employee',
                'team_id' => $employeeData['team_id']
            ]);
        }
    }
}
