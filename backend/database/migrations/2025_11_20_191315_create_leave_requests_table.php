<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('leave_type', ['coffee', 'lunch', 'personal', 'medical', 'vacation']);
            $table->boolean('is_paid');
            $table->boolean('is_fully_day');
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->enum('status', ['requested', 'approved', 'rejected', 'cancelled'])->default('requested');
            $table->dateTime('approved_at')->nullable();
            $table->string('note', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
