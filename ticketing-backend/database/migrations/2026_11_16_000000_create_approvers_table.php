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
            $table->enum('form_key', [
                'support',
                'customer',
                'vendor',
                'material',
                'gl',
                'user id',
                'cost center and profit center',
                'wbs',
                '*',
            ]);
            $table->string('module')->nullable();
            $table->enum('role', [
                'ACC_DEPT_HEAD',
                'ACCOUNTING_STAFF',
                'ACCOUNTING_HEAD',
                'TAX_STAFF',
                'TAX_HEAD',
                'IT_SAP_HEAD',
                'PIC',
            ]);
            $table->string('nik');
            $table->string('email');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->unique(
                ['form_key', 'module', 'role', 'nik', 'email'],
                'approvers_form_module_role_nik_email_unique'
            );

            $table->index([
                'form_key',
                'module',
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
