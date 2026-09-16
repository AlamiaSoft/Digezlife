<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alamia_journeys', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('alamia_journey_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journey_id')->constrained('alamia_journeys')->cascadeOnDelete();
            $table->string('key');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->timestamps();

            $table->unique(['journey_id', 'key']);
        });

        Schema::create('alamia_journey_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journey_id')->constrained('alamia_journeys')->cascadeOnDelete();
            $table->foreignId('journey_step_id')->constrained('alamia_journey_steps')->cascadeOnDelete();
            $table->morphs('context'); // Tenant, User, etc.
            $table->string('status')->default('pending'); // pending, completed, skipped
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['journey_step_id', 'context_type', 'context_id'], 'journey_progress_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alamia_journey_progress');
        Schema::dropIfExists('alamia_journey_steps');
        Schema::dropIfExists('alamia_journeys');
    }
};
