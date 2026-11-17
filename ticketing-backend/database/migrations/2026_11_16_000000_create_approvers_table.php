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
        Schema::create('approvers', function (Blueprint $table) {
            $table->id();
            $table->string('form_key', 100);
            $table->string('role', 50);
            $table->string('nik', 50);
            $table->string('email');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->unique(
                ['form_key', 'role', 'nik', 'email'],
                'approvers_form_role_nik_email_unique'
            );

            $table->index([
                'form_key',
                'role',
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
        Schema::dropIfExists('approvers');
    }
};
