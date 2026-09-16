<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alamia_usages', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->integer('value')->default(0);
            $table->nullableMorphs('context');
            $table->timestamps();

            $table->unique(['key', 'context_type', 'context_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alamia_usages');
    }
};
