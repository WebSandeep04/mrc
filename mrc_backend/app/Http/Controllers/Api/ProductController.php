<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['brand', 'category', 'variants.attributeValues.attribute']);

        // 1. Filter by Category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // 2. Filter by Brand
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // 3. Filter by Price Range
        if ($request->has('min_price')) {
            $query->where('max_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('min_price', '<=', $request->max_price);
        }

        // 4. Filter by Attributes (Complex)
        if ($request->has('attributes')) {
            $attributeValueIds = $request->input('attributes'); // Expecting array of attribute_value IDs
            $query->whereHas('variants.attributeValues', function($q) use ($attributeValueIds) {
                $q->whereIn('attribute_values.id', $attributeValueIds);
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'nullable|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.sku' => 'required|string|unique:product_variants,sku',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.attribute_values' => 'required|array',
            'variants.*.attribute_values.*' => 'exists:attribute_values,id'
        ]);

        return DB::transaction(function () use ($request) {
            $productData = $request->only([
                'name', 'brand_id', 'category_id', 'short_description', 
                'long_description', 'status', 'seo_title', 'seo_description'
            ]);
            $productData['slug'] = Str::slug($request->name);

            $product = Product::create($productData);

            $prices = [];
            foreach ($request->variants as $variantData) {
                $variant = $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'barcode' => $variantData['barcode'] ?? null,
                    'price' => $variantData['price'],
                    'compare_at_price' => $variantData['compare_at_price'] ?? null,
                    'stock_quantity' => $variantData['stock_quantity'],
                    'weight' => $variantData['weight'] ?? null,
                    'dimensions' => $variantData['dimensions'] ?? null,
                ]);

                $variant->attributeValues()->sync($variantData['attribute_values']);
                $prices[] = $variantData['price'];
            }

            // Update min/max price on parent product
            $product->update([
                'min_price' => min($prices),
                'max_price' => max($prices)
            ]);

            return response()->json($product->load('variants.attributeValues'), 201);
        });
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['brand', 'category', 'variants.attributeValues.attribute', 'images']));
    }

    public function update(Request $request, Product $product)
    {
        // Update product container info
        $product->update($request->only([
            'name', 'brand_id', 'category_id', 'short_description', 
            'long_description', 'status', 'seo_title', 'seo_description'
        ]));

        if ($request->has('name')) {
            $product->update(['slug' => Str::slug($request->name)]);
        }

        if ($request->has('variants')) {
            // Very simplified: delete old, create new for complete one-page edit sync
            $product->variants()->delete();
            $prices = [];
            foreach ($request->variants as $variantData) {
                $variant = $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'barcode' => $variantData['barcode'] ?? null,
                    'price' => $variantData['price'],
                    'compare_at_price' => $variantData['compare_at_price'] ?? null,
                    'stock_quantity' => $variantData['stock_quantity'],
                    'weight' => $variantData['weight'] ?? null,
                    'dimensions' => $variantData['dimensions'] ?? null,
                ]);

                if (isset($variantData['attribute_values'])) {
                    $variant->attributeValues()->sync($variantData['attribute_values']);
                }
                $prices[] = $variantData['price'];
            }
            if (count($prices) > 0) {
                $product->update([
                    'min_price' => min($prices),
                    'max_price' => max($prices)
                ]);
            }
        }

        return response()->json($product->load('variants'));
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
