<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Outgoing webhooks configuration
        Schema::create('alamia_webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->morphs('context'); // Tenant, User, etc.
            $table->string('name');
            $table->string('url');
            $table->string('secret')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('alamia_webhook_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('endpoint_id')->constrained('alamia_webhook_endpoints')->cascadeOnDelete();
            $table->string('event_name'); // e.g. CustomerCreated
            $table->timestamps();

            $table->unique(['endpoint_id', 'event_name']);
        });

        Schema::create('alamia_webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('endpoint_id')->constrained('alamia_webhook_endpoints')->cascadeOnDelete();
            $table->string('event_name');
            $table->json('payload');
            $table->string('status')->default('pending'); // pending, success, failed
            $table->timestamps();
        });

        Schema::create('alamia_webhook_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained('alamia_webhook_deliveries')->cascadeOnDelete();
            $table->integer('response_status')->nullable();
            $table->text('response_body')->nullable();
            $table->boolean('is_successful')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alamia_webhook_attempts');
        Schema::dropIfExists('alamia_webhook_deliveries');
        Schema::dropIfExists('alamia_webhook_subscriptions');
        Schema::dropIfExists('alamia_webhook_endpoints');
    }
};
