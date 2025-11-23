<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Ejecuta todos los seeders de la aplicacion.
     */
    public function run(): void
    {
        $this->call([
            TeamSeeder::class,
            UserSeeder::class,
            WorkSessionSeeder::class,
            BreakSeeder::class,
            LeaveRequestSeeder::class,
        ]);
    }
}
