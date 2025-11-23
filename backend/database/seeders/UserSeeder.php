<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get teams
        $devTeam = Team::where('name', 'Development Team')->first();
        $marketingTeam = Team::where('name', 'Marketing Team')->first();
        $salesTeam = Team::where('name', 'Sales Team')->first();

        // Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'admin',
            'team_id' => null
        ]);

        // Development Team
        $devSupervisor = User::create([
            'name' => 'Dev Supervisor',
            'email' => 'dev.supervisor@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'supervisor',
            'team_id' => $devTeam->id
        ]);

        User::create([
            'name' => 'John Developer',
            'email' => 'john.dev@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'employee',
            'team_id' => $devTeam->id
        ]);

        User::create([
            'name' => 'Jane Developer',
            'email' => 'jane.dev@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'employee',
            'team_id' => $devTeam->id
        ]);

        // Set supervisor for dev team
        $devTeam->supervisor_user_id = $devSupervisor->id;
        $devTeam->save();

        // Marketing Team
        $marketingSupervisor = User::create([
            'name' => 'Marketing Supervisor',
            'email' => 'marketing.supervisor@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'supervisor',
            'team_id' => $marketingTeam->id
        ]);

        User::create([
            'name' => 'Alice Marketing',
            'email' => 'alice.marketing@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'employee',
            'team_id' => $marketingTeam->id
        ]);

        User::create([
            'name' => 'Bob Marketing',
            'email' => 'bob.marketing@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'employee',
            'team_id' => $marketingTeam->id
        ]);

        // Set supervisor for marketing team
        $marketingTeam->supervisor_user_id = $marketingSupervisor->id;
        $marketingTeam->save();

        // Sales Team
        $salesSupervisor = User::create([
            'name' => 'Sales Supervisor',
            'email' => 'sales.supervisor@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'supervisor',
            'team_id' => $salesTeam->id
        ]);

        User::create([
            'name' => 'Charlie Sales',
            'email' => 'charlie.sales@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'employee',
            'team_id' => $salesTeam->id
        ]);

        User::create([
            'name' => 'Diana Sales',
            'email' => 'diana.sales@ontime.com',
            'password_hash' => Hash::make('password'),
            'role' => 'employee',
            'team_id' => $salesTeam->id
        ]);

        // Set supervisor for sales team
        $salesTeam->supervisor_user_id = $salesSupervisor->id;
        $salesTeam->save();
    }
}
