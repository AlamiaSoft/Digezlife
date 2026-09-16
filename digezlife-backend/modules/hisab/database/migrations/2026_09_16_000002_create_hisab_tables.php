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
        Schema::create('hisab_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->unique()->nullable();
            $table->string('tenant_id')->index();
            $table->enum('type', ['income', 'expense', 'transfer'])->default('expense');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('PKR');
            $table->string('category')->default('General'); // Food, Utilities, Transport, Shopping, Medical, Salary, Freelance
            $table->string('payment_method')->default('Cash'); // Cash, JazzCash, Easypaisa, Bank, Card
            $table->date('transaction_date');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'transaction_date']);
            $table->index(['tenant_id', 'type']);
            $table->index(['tenant_id', 'category']);
        });

        Schema::create('hisab_debts', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->unique()->nullable();
            $table->string('tenant_id')->index();
            $table->enum('direction', ['lent', 'borrowed']); // lent = You gave money to someone; borrowed = You took money
            $table->string('person_name');
            $table->string('person_phone')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending', 'partial', 'settled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'direction', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hisab_debts');
        Schema::dropIfExists('hisab_transactions');
    }
};
