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
        Schema::create('submission_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')
                ->constrained('submissions')
                ->cascadeOnDelete();
            $table->string('step', 30);
            $table->string('action', 20);
            $table->foreignId('acted_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->json('step_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submission_approvals');
    }
};
