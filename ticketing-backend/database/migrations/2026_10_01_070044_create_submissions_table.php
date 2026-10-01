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
            $table->string('prefix', 20);
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('last_number')->default(0);
            $table->timestamps();

            $table->unique(['prefix', 'year']);
        });
        
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('requestor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('number', 30)->unique();

            $table->string('type', 20);
            $table->string('category', 100)->nullable();
            $table->string('sub_category', 100)->nullable();

            $table->string('form_type', 100);

            /*
             * DRAFT
             * SUBMITTED
             */
            $table->string('status', 20)->default('DRAFT');

            /*
             * Seluruh isi form disimpan sebagai JSON.
             */
            $table->json('form_data');

            /*
             * Metadata attachment.
             */
            $table->json('attachments')->nullable();

            $table->timestamp('submitted_at')->nullable();

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
