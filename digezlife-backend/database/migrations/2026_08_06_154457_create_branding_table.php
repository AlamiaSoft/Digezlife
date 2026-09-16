<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branding', function (Blueprint $table) {
            $table->id();
            $table->string('app_name')->default('Alamia');
            $table->string('tagline')->nullable();
            $table->string('primary_color')->default('#6366f1');
            $table->string('secondary_color')->default('#8b5cf6');
            $table->string('accent_color')->default('#06b6d4');
            $table->string('footer_copyright')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('github_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branding');
    }
};
