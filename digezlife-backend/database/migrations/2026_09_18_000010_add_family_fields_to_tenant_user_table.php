<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_user', function (Blueprint $table): void {
            $table->string('name')->nullable()->after('invited_by');
            $table->string('phone')->nullable()->after('name');
            $table->string('display_name')->nullable()->after('phone');
            $table->string('avatar_url')->nullable()->after('display_name');
            $table->timestamp('last_activity_at')->nullable()->after('avatar_url');
        });
    }

    public function down(): void
    {
        Schema::table('tenant_user', function (Blueprint $table): void {
            $table->dropColumn(['name', 'phone', 'display_name', 'avatar_url', 'last_activity_at']);
        });
    }
};
