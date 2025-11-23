<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migracion: crea tabla leave_requests.
     */
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('leave_type', ['vacation', 'medical', 'personal']);
            $table->boolean('is_paid');
            $table->boolean('is_full_day')->default(true);
            $table->decimal('duration_hours', 5, 1)->nullable(); // Para medias jornadas, en bloques de 0.5h
            $table->dateTime('start_at');
            $table->dateTime('end_at')->nullable(); // Nulo si es un solo dia
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->dateTime('reviewed_at')->nullable();
            $table->text('note'); // Campo obligatorio
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Revierte la migracion.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
