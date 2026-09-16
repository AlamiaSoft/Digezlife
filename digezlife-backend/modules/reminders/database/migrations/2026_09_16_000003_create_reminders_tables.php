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
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->unique()->nullable();
            $table->string('tenant_id')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('General'); // Bill, Medicine, Renewal, Birthday, Maintenance, General
            $table->dateTime('due_at');
            $table->enum('recurrence_rule', ['none', 'daily', 'weekly', 'monthly', 'yearly'])->default('none');
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->json('notification_channels')->nullable(); // ["push", "whatsapp", "email"]
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'due_at', 'is_completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
