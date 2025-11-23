<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = [
            ['name' => 'Development Team'],
            ['name' => 'Marketing Team'],
            ['name' => 'Sales Team']
        ];

        foreach ($teams as $teamData) {
            Team::create($teamData);
        }
    }
}
