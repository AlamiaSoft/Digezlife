<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_invitations', function (Blueprint $table): void {
            $table->string('phone')->nullable()->after('email');
            $table->string('name')->nullable()->after('phone');
            $table->json('capabilities')->nullable()->after('name');
            $table->string('status')->default('pending')->after('capabilities');
        });
    }

    public function down(): void
    {
        Schema::table('tenant_invitations', function (Blueprint $table): void {
            $table->dropColumn(['phone', 'name', 'capabilities', 'status']);
        });
    }
};
