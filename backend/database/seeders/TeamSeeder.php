<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        // Create teams (supervisors will be assigned after users are created)
        Team::create([
            'name' => 'Development Team',
            'active' => true,
        ]);

        Team::create([
            'name' => 'Sales Team',
            'active' => true,
        ]);

        Team::create([
            'name' => 'HR Team',
            'active' => true,
        ]);
    }
}
