<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migracion: agrega rol, equipo y activo al usuario.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['employee', 'supervisor', 'admin'])->default('employee')->after('email');
            $table->foreignId('team_id')->nullable()->constrained('teams')->onDelete('set null')->after('role');
            $table->boolean('active')->default(true)->after('team_id');
        });
    }

    /**
     * Revierte la migracion.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['team_id']);
            $table->dropColumn(['role', 'team_id', 'active']);
        });
    }
};
