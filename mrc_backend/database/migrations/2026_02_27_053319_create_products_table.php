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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->longText('long_description')->nullable();
            $table->decimal('min_price', 12, 2)->default(0);
            $table->decimal('max_price', 12, 2)->default(0);
            $table->string('status')->default('draft'); // draft, published
            $table->string('type')->default('simple'); // simple, variable
            $table->softDeletes();
            $table->timestamps();

            // Indexes for core filtering
            $table->index(['status'], 'idx_status');
            $table->index(['status', 'min_price', 'max_price'], 'idx_price_range');
        });

        // Pivot table for Many-to-Many Categories
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Pivot table for Many-to-Many Brands
        Schema::create('brand_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brand_product');
        Schema::dropIfExists('category_product');
        Schema::dropIfExists('products');
    }
};
