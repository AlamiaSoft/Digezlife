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
        Schema::table('hisab_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('hisab_transactions', 'destination_payment_method')) {
                $table->string('destination_payment_method')->nullable()->after('payment_method');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hisab_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('hisab_transactions', 'destination_payment_method')) {
                $table->dropColumn('destination_payment_method');
            }
        });
    }
};
