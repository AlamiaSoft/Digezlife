<?php

namespace Alamia\Core\Controllers\API\V1\SuperAdmin;

use Alamia\Core\Billing\Models\Plan;
use Alamia\Core\Http\Resources\PlanResource;
use Alamia\Core\Shared\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlanController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $plans = Plan::with('products')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return $this->paginatedResponse($plans, \Alamia\Core\Billing\Http\Resources\PlanResource::class);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug',
            'price' => 'required|integer|min:0',
            'currency' => 'required|string|size:3',
            'interval' => 'required|in:monthly,yearly',
            'is_active' => 'boolean',
            'products' => 'array',
            'products.*' => 'exists:products,id',
        ]);

        $plan = Plan::create(collect($validated)->except('products')->toArray());

        if (isset($validated['products'])) {
            $plan->products()->sync($validated['products']);
        }

        return $this->createdResponse(new PlanResource($plan->load('products')));
    }

    public function show(Plan $plan): JsonResponse
    {
        return $this->successResponse(new PlanResource($plan->load('products')));
    }

    public function update(Request $request, Plan $plan): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('plans')->ignore($plan->id)],
            'price' => 'sometimes|integer|min:0',
            'currency' => 'sometimes|string|size:3',
            'interval' => 'sometimes|in:monthly,yearly',
            'is_active' => 'boolean',
            'products' => 'array',
            'products.*' => 'exists:products,id',
        ]);

        $plan->update(collect($validated)->except('products')->toArray());

        if (isset($validated['products'])) {
            $plan->products()->sync($validated['products']);
        }

        return $this->successResponse(new PlanResource($plan->load('products')));
    }

    public function destroy(Plan $plan): JsonResponse
    {
        $plan->delete();

        return $this->noContentResponse();
    }
}
