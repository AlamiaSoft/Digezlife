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
            if (!Schema::hasColumn('hisab_transactions', 'transfer_type')) {
                $table->string('transfer_type')->nullable()->after('destination_payment_method');
            }
            if (!Schema::hasColumn('hisab_transactions', 'recipient_name')) {
                $table->string('recipient_name')->nullable()->after('transfer_type');
            }
            if (!Schema::hasColumn('hisab_transactions', 'recipient_user_id')) {
                $table->foreignId('recipient_user_id')->nullable()->after('recipient_name')->constrained('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hisab_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('hisab_transactions', 'recipient_user_id')) {
                $table->dropForeign(['recipient_user_id']);
                $table->dropColumn('recipient_user_id');
            }
            if (Schema::hasColumn('hisab_transactions', 'recipient_name')) {
                $table->dropColumn('recipient_name');
            }
            if (Schema::hasColumn('hisab_transactions', 'transfer_type')) {
                $table->dropColumn('transfer_type');
            }
        });
    }
};
