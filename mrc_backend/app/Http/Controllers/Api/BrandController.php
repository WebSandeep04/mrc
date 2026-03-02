<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::latest()->get()->map(function ($brand) {
            $brand->logo = $brand->logo_path ? asset('storage/' . $brand->logo_path) : null;
            return $brand;
        });
        return response()->json($brands);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('EXTREME DEBUG - Store reached');
            \Log::info('Data received:', $request->all());

            $brand = new Brand();
            $brand->name = $request->name ?? 'Untitled';
            $brand->slug = Str::slug($brand->name) . '-' . time();
            $brand->description = $request->description;
            $brand->is_active = true;

            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('brands', 'public');
                $brand->logo_path = $path;
            }

            $brand->save();
            \Log::info('Brand saved with ID: ' . $brand->id);

            return response()->json($brand, 201);
        } catch (\Exception $e) {
            \Log::error('Brand Store Error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function show(Brand $brand)
    {
        $brand->logo = $brand->logo_path ? asset('storage/' . $brand->logo_path) : null;
        return response()->json($brand);
    }

    public function update(Request $request, Brand $brand)
    {
        try {
            \Log::info('EXTREME DEBUG - Update reached for ID: ' . $brand->id);
            \Log::info('Update data received:', $request->all());

            if ($request->has('name')) {
                $brand->name = $request->name;
                $brand->slug = Str::slug($request->name);
            }

            if ($request->has('description')) {
                $brand->description = $request->description;
            }

            if ($request->has('is_active')) {
                $brand->is_active = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            }

            if ($request->hasFile('logo')) {
                if ($brand->logo_path) {
                    Storage::disk('public')->delete($brand->logo_path);
                }
                $brand->logo_path = $request->file('logo')->store('brands', 'public');
            }

            $brand->save();
            \Log::info('Brand updated successfully');

            $brand->logo = $brand->logo_path ? asset('storage/' . $brand->logo_path) : null;
            return response()->json($brand);
        } catch (\Exception $e) {
            \Log::error('Brand Update Error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Brand $brand)
    {
        if ($brand->logo_path) {
            Storage::disk('public')->delete($brand->logo_path);
        }
        $brand->delete();
        return response()->json(null, 204);
    }
}
