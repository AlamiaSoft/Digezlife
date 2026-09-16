<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing_plan_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketing_plan_id')->constrained()->cascadeOnDelete();
            $table->string('feature');
            $table->boolean('included')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing_plan_features');
    }
};
