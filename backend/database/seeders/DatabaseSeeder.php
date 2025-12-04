<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Ejecuta todos los seeders de la aplicacion.
     * Solo se ejecuta si la base de datos esta vacia (primer despliegue).
     */
    public function run(): void
    {
        // Solo ejecutar seeders si no hay usuarios en la base de datos
        if (\App\Models\User::count() === 0) {
            \Log::info('Database is empty. Running seeders...');
            $this->call([
                TeamSeeder::class,
                UserSeeder::class,
                WorkSessionSeeder::class,
                BreakSeeder::class,
                LeaveRequestSeeder::class,
            ]);
        } else {
            \Log::info('Database already has data. Skipping seeders.');
        }
    }
}
