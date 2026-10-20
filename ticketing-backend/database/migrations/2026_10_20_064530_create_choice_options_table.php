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
        Schema::create('choice_options', function (Blueprint $table) {
            $table->id();

            $table->foreignId('choice_group_id')
                ->constrained('choice_groups')
                ->cascadeOnDelete();

            $table->string('value');
            $table->string('label');
            $table->unsignedInteger('sort_order')->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();

            $table->unique(
                ['choice_group_id', 'value'],
                'choice_options_group_value_unique'
            );

            $table->index([
                'choice_group_id',
                'start_date',
                'end_date',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('choice_options');
    }
};
