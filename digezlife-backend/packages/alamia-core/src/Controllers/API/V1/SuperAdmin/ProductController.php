<?php

namespace Alamia\Core\Controllers\API\V1\SuperAdmin;

use Alamia\Core\Billing\Models\Product;
use Alamia\Core\Http\Resources\ProductResource;
use Alamia\Core\Shared\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return $this->paginatedResponse($products, \Alamia\Core\Billing\Http\Resources\ProductResource::class);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $product = Product::create($validated);

        return $this->createdResponse(new ProductResource($product));
    }

    public function show(Product $product): JsonResponse
    {
        return $this->successResponse(new ProductResource($product));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return $this->successResponse(new ProductResource($product));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->noContentResponse();
    }
}
