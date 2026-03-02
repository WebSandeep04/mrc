<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        // Return only top-level categories with their children (tree structure)
        return response()->json(Category::whereNull('parent_id')->with('children')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image_path' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $validated['slug'] = Str::slug($request->name);
        
        // Calculate level based on parent
        if ($request->parent_id) {
            $parent = Category::find($request->parent_id);
            $validated['level'] = $parent->level + 1;
        }

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->load('children'));
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image_path' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        if ($request->has('name')) {
            $validated['slug'] = Str::slug($request->name);
        }

        if ($request->has('parent_id') && $request->parent_id != $category->parent_id) {
            if ($request->parent_id) {
                $parent = Category::find($request->parent_id);
                $validated['level'] = $parent->level + 1;
            } else {
                $validated['level'] = 0;
            }
        }

        $category->update($validated);
        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        // Handle child categories if any (logic could vary, e.g., move to parent or delete)
        $category->delete();
        return response()->json(null, 204);
    }
}
