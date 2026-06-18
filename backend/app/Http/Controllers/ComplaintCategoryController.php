<?php

namespace App\Http\Controllers;

use App\Models\ComplaintCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintCategoryController extends Controller
{
    /**
     * Display a listing of all complaint categories.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $categories = ComplaintCategory::orderBy('name')->get();

        return response()->json($categories);
    }

    /**
     * Display a listing of active complaint categories.
     *
     * Used by the frontend complaint form to populate the dropdown.
     *
     * @return JsonResponse
     */
    public function active(): JsonResponse
    {
        $categories = ComplaintCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    /**
     * Store a newly created category.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:complaint_categories,name'],
            'description' => ['nullable', 'string', 'max:500'],
            'synonyms'    => ['nullable', 'array'],
            'synonyms.*'  => ['string', 'max:100'],
            'is_active'   => ['boolean'],
        ]);

        $category = ComplaintCategory::create($validated);

        return response()->json([
            'message'  => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    /**
     * Display the specified category.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $category = ComplaintCategory::findOrFail($id);

        return response()->json($category);
    }

    /**
     * Update the specified category.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = ComplaintCategory::findOrFail($id);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:complaint_categories,name,' . $id],
            'description' => ['nullable', 'string', 'max:500'],
            'synonyms'    => ['nullable', 'array'],
            'synonyms.*'  => ['string', 'max:100'],
            'is_active'   => ['boolean'],
        ]);

        $category->update($validated);

        return response()->json([
            'message'  => 'Category updated successfully.',
            'category' => $category,
        ]);
    }

    /**
     * Remove the specified category.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $category = ComplaintCategory::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}
