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
            $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('long_description')->nullable();
            $table->decimal('min_price', 12, 2)->default(0);
            $table->decimal('max_price', 12, 2)->default(0);
            $table->string('status')->default('draft'); // draft, published
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Indexes for core filtering
            $table->index(['category_id', 'brand_id', 'status'], 'idx_cat_brand_status');
            $table->index(['status', 'min_price', 'max_price'], 'idx_price_range');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
