<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\ProductImage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['brands', 'categories', 'variants.attributeValues.attribute']);

        // 1. Filter by Category (Support multiple)
        if ($request->has('category_id')) {
            $categoryIds = is_array($request->category_id) ? $request->category_id : [$request->category_id];
            $query->whereHas('categories', function($q) use ($categoryIds) {
                $q->whereIn('categories.id', $categoryIds);
            });
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

        // 4. Filter by Attributes
        if ($request->has('attributes')) {
            $attributeValueIds = $request->input('attributes');
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
            'brand_ids' => 'nullable|array',
            'brand_ids.*' => 'exists:brands,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'type' => 'required|in:simple,variable',
            'variants' => 'required|array|min:1',
            'variants.*.sku' => 'required|string|unique:product_variants,sku',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.attribute_values' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request) {
            $productData = $request->only([
                'name',
                'long_description', 'status', 'type'
            ]);
            $productData['slug'] = $request->slug ?? Str::slug($request->name);

            $product = Product::create($productData);

            // Many-to-Many Brands
            if ($request->has('brand_ids')) {
                $product->brands()->sync($request->brand_ids);
            }

            // Many-to-Many Categories
            if ($request->has('category_ids')) {
                $product->categories()->sync($request->category_ids);
            }

            $prices = [];
            foreach ($request->variants as $variantData) {
                $variantPath = null;
                if (!empty($variantData['file_path']) && str_starts_with($variantData['file_path'], 'data:image')) {
                    $variantPath = $this->saveBase64Image($variantData['file_path'], 'products');
                }

                $variant = $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'price' => $variantData['price'],
                    'compare_at_price' => $variantData['compare_at_price'] ?? null,
                    'stock_quantity' => $variantData['stock_quantity'],
                    'file_path' => $variantPath ?? ($variantData['file_path'] ?? null),
                ]);

                if (!empty($variantData['attribute_values'])) {
                    $variant->attributeValues()->sync($variantData['attribute_values']);
                }
                $prices[] = $variantData['price'];
            }

            $product->update([
                'min_price' => min($prices),
                'max_price' => max($prices)
            ]);

            $this->handleImages($product, $request->file('images') ?? $request->input('images'));

            return response()->json($product->load('variants.attributeValues', 'categories', 'brands', 'images'), 201);
        });
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['brands', 'categories', 'variants.attributeValues.attribute', 'images']));
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'brand_ids' => 'nullable|array',
            'brand_ids.*' => 'exists:brands,id',
            'category_ids' => 'nullable|array',
            'type' => 'sometimes|required|in:simple,variable',
            'variants' => 'sometimes|array|min:1',
            'images' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request, $product) {
            $product->update($request->only([
                'name',
                'long_description', 'status', 'type'
            ]));

            if ($request->has('brand_ids')) {
                $product->brands()->sync($request->brand_ids);
            }

            if ($request->has('name')) {
                $product->update(['slug' => Str::slug($request->name)]);
            }

            if ($request->has('category_ids')) {
                $product->categories()->sync($request->category_ids);
            }

            if ($request->has('variants')) {
                $incomingVariantIds = [];
                $prices = [];

                foreach ($request->variants as $variantData) {
                    $variantPath = null;
                    if (!empty($variantData['file_path']) && str_starts_with($variantData['file_path'], 'data:image')) {
                        $variantPath = $this->saveBase64Image($variantData['file_path'], 'products');
                    }

                    $variant = $product->variants()->updateOrCreate(
                        ['sku' => $variantData['sku']], // Use SKU as unique identifier
                        [
                            'price' => $variantData['price'],
                            'compare_at_price' => $variantData['compare_at_price'] ?? null,
                            'stock_quantity' => $variantData['stock_quantity'],
                            'file_path' => $variantPath ?? ($variantData['file_path'] ?? null),
                        ]
                    );

                    if (isset($variantData['attribute_values'])) {
                        $variant->attributeValues()->sync($variantData['attribute_values']);
                    }
                    
                    $incomingVariantIds[] = $variant->id;
                    $prices[] = $variantData['price'];
                }

                // Scalability: Delete variants that are no longer present in the request
                $product->variants()->whereNotIn('id', $incomingVariantIds)->delete();

                if (count($prices) > 0) {
                    $product->update([
                        'min_price' => min($prices),
                        'max_price' => max($prices)
                    ]);
                }
            }

            if ($request->has('images')) {
                // For simplicity, clear and re-add or implement more complex logic. 
                // Scalability tip: only add new ones, but let's clear for MVP sync.
                $product->images()->delete();
                $this->handleImages($product, $request->file('images') ?? $request->input('images'));
            }

            return response()->json($product->load('variants', 'categories', 'brands', 'images'));
        });
    }

    private function handleImages($product, $images)
    {
        if (!$images) return;

        foreach ($images as $index => $image) {
            if ($image instanceof \Illuminate\Http\UploadedFile) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'file_path' => $path,
                    'is_primary' => $index === 0,
                    'sort_order' => $index
                ]);
            } elseif (is_string($image) && str_starts_with($image, 'data:image')) {
                $filePath = $this->saveBase64Image($image, 'products');
                
                $product->images()->create([
                    'file_path' => $filePath,
                    'is_primary' => $index === 0,
                    'sort_order' => $index
                ]);
            }
        }
    }

    private function saveBase64Image($base64String, $directory)
    {
        $imageData = explode(',', $base64String);
        $extension = str_replace(['data:image/', ';base64'], '', $imageData[0]);
        $fileName = Str::random(20) . '.' . $extension;
        $decodedImage = base64_decode($imageData[1]);
        $path = $directory . '/' . $fileName;
        Storage::disk('public')->put($path, $decodedImage);
        return $path;
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
