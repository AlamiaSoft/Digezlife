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
        Schema::table('member_activity_log', function (Blueprint $table) {
            $table->json('dismissed_by')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_activity_log', function (Blueprint $table) {
            $table->dropColumn('dismissed_by');
            $table->dropSoftDeletes();
        });
    }
};
