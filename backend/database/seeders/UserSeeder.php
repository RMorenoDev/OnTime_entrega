<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Team;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@ontime.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'admin',
            'active' => true,
        ]);

        // Create Supervisors
        $supervisor1 = User::create([
            'name' => 'John Supervisor',
            'email' => 'supervisor1@ontime.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'supervisor',
            'team_id' => 1, // Development Team
            'active' => true,
        ]);

        $supervisor2 = User::create([
            'name' => 'Jane Supervisor',
            'email' => 'supervisor2@ontime.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'supervisor',
            'team_id' => 2, // Sales Team
            'active' => true,
        ]);

        // Update teams with supervisors
        Team::find(1)->update(['supervisor_user_id' => $supervisor1->id]);
        Team::find(2)->update(['supervisor_user_id' => $supervisor2->id]);

        // Create Employees
        User::create([
            'name' => 'Alice Employee',
            'email' => 'employee1@ontime.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'employee',
            'team_id' => 1, // Development Team
            'active' => true,
        ]);

        User::create([
            'name' => 'Bob Employee',
            'email' => 'employee2@ontime.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'employee',
            'team_id' => 1, // Development Team
            'active' => true,
        ]);

        User::create([
            'name' => 'Charlie Employee',
            'email' => 'employee3@ontime.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'employee',
            'team_id' => 2, // Sales Team
            'active' => true,
        ]);
    }
}
