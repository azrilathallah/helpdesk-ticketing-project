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
        Schema::create('form_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('prefix');
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('last_number')->default(0);

            $table->unique(['prefix', 'year']);
        });
        
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requestor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('number')->unique();
            $table->string('type');
            $table->string('category')->nullable();
            $table->string('sub_category')->nullable();
            $table->string('form_type');
            $table->string('status')->default('DRAFT');
            $table->json('form_data');
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->index([
                'requestor_id',
                'status'
            ]);

            $table->index([
                'type',
                'created_at'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('form_sequences');
    }
};
