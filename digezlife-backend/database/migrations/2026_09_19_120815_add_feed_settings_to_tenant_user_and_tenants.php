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
        Schema::table('tenant_user', function (Blueprint $table) {
            $table->timestamp('activity_feed_cleared_at')->nullable();
            $table->json('dismissed_activities')->nullable();
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->timestamp('activity_feed_cleared_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_user', function (Blueprint $table) {
            $table->dropColumn(['activity_feed_cleared_at', 'dismissed_activities']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('activity_feed_cleared_at');
        });
    }
};
