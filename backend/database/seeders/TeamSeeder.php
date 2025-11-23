<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $teams = [
            ['name' => 'Equipo Comercial'],
            ['name' => 'Equipo Técnico'],
            ['name' => 'Equipo Logística'], // Este tendrá turno partido
        ];

        foreach ($teams as $teamData) {
            Team::create($teamData);
        }
    }
}
