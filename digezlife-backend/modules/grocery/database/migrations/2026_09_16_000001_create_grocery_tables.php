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
        Schema::create('grocery_lists', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->unique()->nullable();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->string('icon')->default('shopping-cart');
            $table->string('color')->default('teal');
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('grocery_items', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->unique()->nullable();
            $table->string('tenant_id')->index();
            $table->foreignId('grocery_list_id')->constrained('grocery_lists')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('quantity', 8, 2)->default(1);
            $table->string('unit')->default('pcs'); // kg, g, liters, packet, dozen, pcs
            $table->string('category')->default('General'); // Produce, Dairy, Pantry, Meat, Household
            $table->boolean('is_checked')->default(false);
            $table->boolean('is_recurring')->default(false);
            $table->timestamp('checked_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'grocery_list_id', 'is_checked']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grocery_items');
        Schema::dropIfExists('grocery_lists');
    }
};
