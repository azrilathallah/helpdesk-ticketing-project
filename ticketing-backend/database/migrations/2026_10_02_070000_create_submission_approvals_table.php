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
        /*
         * Perbesar kolom status agar cukup untuk
         * status-status baru yang lebih panjang.
         */
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('status', 50)->default('DRAFT')->change();
        });

        /*
         * Tabel untuk mencatat setiap langkah approval.
         */
        Schema::create('submission_approvals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('submission_id')
                ->constrained('submissions')
                ->cascadeOnDelete();

            /*
             * Step approval:
             *
             * DIV_HEAD_APPROVE
             * ACCOUNTING_FILL
             * ACCOUNTING_APPROVE
             * TAX_FILL
             * TAX_APPROVE
             * PIC_PROCESS
             */
            $table->string('step', 30);

            /*
             * Action yang dilakukan:
             *
             * APPROVED
             * FILLED
             * REJECTED
             * CANCELLED
             * SOLVED
             */
            $table->string('action', 20);

            $table->foreignId('acted_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->text('notes')->nullable();

            /*
             * Data tambahan yang di-input pada step ini.
             * Contoh: accounting fields, tax fields, customer code.
             */
            $table->json('step_data')->nullable();

            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submission_approvals');

        Schema::table('submissions', function (Blueprint $table) {
            $table->string('status', 20)->default('DRAFT')->change();
        });
    }
};
