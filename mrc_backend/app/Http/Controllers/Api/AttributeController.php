<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeController extends Controller
{
    public function index()
    {
        return response()->json(Attribute::with('values')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'display_name' => 'required|string|max:255',
            'type' => 'nullable|string|in:text,select,swatch',
            'values' => 'nullable|array',
            'values.*.value' => 'required_with:values|string',
            'values.*.meta' => 'nullable|string'
        ]);

        $validated['slug'] = Str::slug($request->name);

        $attribute = Attribute::create($validated);

        if ($request->has('values')) {
            foreach ($request->values as $valueData) {
                $attribute->values()->create($valueData);
            }
        }

        return response()->json($attribute->load('values'), 201);
    }

    public function show(Attribute $attribute)
    {
        return response()->json($attribute->load('values'));
    }

    public function update(Request $request, Attribute $attribute)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'display_name' => 'sometimes|required|string|max:255',
            'type' => 'nullable|string|in:text,select,swatch',
        ]);

        if ($request->has('name')) {
            $validated['slug'] = Str::slug($request->name);
        }

        $attribute->update($validated);

        // Management of values would usually be a separate set of endpoints or handled via a sync logic
        // For simplicity, we'll implement sync for values if provided
        if ($request->has('values')) {
            // Delete old and add new (simplest implementation)
            $attribute->values()->delete();
            foreach ($request->values as $valueData) {
                $attribute->values()->create($valueData);
            }
        }

        return response()->json($attribute->load('values'));
    }

    public function destroy(Attribute $attribute)
    {
        $attribute->delete();
        return response()->json(null, 204);
    }
}
