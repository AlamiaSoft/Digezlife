<?php

namespace Alamia\Core\Controllers\API\V1\Auth;

use Alamia\Core\Authorization\Http\Resources\SuperAdminResource;
use Alamia\Core\Authorization\Http\Resources\UserResource;
use Alamia\Core\Identity\Http\Requests\LoginRequest;
use Alamia\Core\Shared\Http\Controllers\BaseController;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Log;

/**
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication endpoints"
 * )
 */
class AuthController extends BaseController
{
    /**
     * Register a new user.
     *
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     summary="Register new user",
     *     tags={"Authentication"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name", "email", "password"},
     *
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8)
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="User registered successfully")
     * )
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        try {
            $userModel = config('tenant-engine.models.user');

            $user = $userModel::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Auto-provision personal household
            $tenantId = 'hsh_' . strtolower(\Illuminate\Support\Str::random(8));
            $tenant = \Alamia\Core\Tenant\Models\Tenant::create([
                'id' => $tenantId,
                'name' => $user->name . "'s Household",
                'status' => 'active',
            ]);
            \App\Models\TenantMembership::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'is_owner' => true,
                'status' => 'active',
                'joined_at' => now(),
            ]);

            if (class_exists(\Modules\Grocery\Models\GroceryList::class)) {
                $groceryList = \Modules\Grocery\Models\GroceryList::create([
                    'tenant_id' => $tenant->id,
                    'name' => 'Weekly Essentials',
                    'icon' => 'cart',
                    'color' => '#0d6b68',
                ]);

                if (class_exists(\Modules\Grocery\Models\GroceryItem::class)) {
                    $defaultItems = [
                        ['name' => 'Fresh Milk', 'quantity' => 2, 'unit' => 'liters', 'category' => 'Dairy'],
                        ['name' => 'Eggs (Dozen)', 'quantity' => 1, 'unit' => 'dozen', 'category' => 'Dairy'],
                        ['name' => 'White Bread / Roti', 'quantity' => 1, 'unit' => 'pack', 'category' => 'Bakery'],
                        ['name' => 'Basmati Rice', 'quantity' => 2, 'unit' => 'kg', 'category' => 'Pantry'],
                        ['name' => 'Cooking Oil / Ghee', 'quantity' => 1, 'unit' => 'liters', 'category' => 'Pantry'],
                        ['name' => 'Tea / Chai Patti', 'quantity' => 1, 'unit' => 'pack', 'category' => 'Pantry'],
                        ['name' => 'Sugar / Shakkar', 'quantity' => 1, 'unit' => 'kg', 'category' => 'Pantry'],
                        ['name' => 'Potatoes (Aloo)', 'quantity' => 2, 'unit' => 'kg', 'category' => 'Produce'],
                        ['name' => 'Onions (Pyaz)', 'quantity' => 2, 'unit' => 'kg', 'category' => 'Produce'],
                        ['name' => 'Dishwashing Soap', 'quantity' => 1, 'unit' => 'bottle', 'category' => 'Household'],
                    ];

                    foreach ($defaultItems as $idx => $item) {
                        \Modules\Grocery\Models\GroceryItem::create([
                            'tenant_id' => $tenant->id,
                            'grocery_list_id' => $groceryList->id,
                            'name' => $item['name'],
                            'quantity' => $item['quantity'],
                            'unit' => $item['unit'],
                            'category' => $item['category'],
                            'is_checked' => false,
                            'sort_order' => $idx,
                        ]);
                    }
                }
            }

            // Record legal acceptances
            if (class_exists(\Modules\Giveback\Models\LegalAcceptance::class)) {
                \Modules\Giveback\Models\LegalAcceptance::create([
                    'user_id' => $user->id,
                    'terms_version' => $request->input('terms_version', 'v1.0'),
                    'privacy_version' => $request->input('privacy_version', 'v1.0'),
                    'accepted_at' => now(),
                    'ip_address' => $request->ip(),
                    'user_agent' => substr((string) $request->userAgent(), 0, 255),
                ]);
            }

            // Process referral if ref parameter provided
            if ($request->filled('ref') && class_exists(\Modules\Giveback\Services\ReferralRewardService::class)) {
                try {
                    app(\Modules\Giveback\Services\ReferralRewardService::class)->processReferralOnSignup($user, (string) $request->input('ref'));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Referral processing error: ' . $e->getMessage());
                }
            }

            // Create token
            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->createdResponse(
                [
                    'type' => 'users',
                    'id' => $user->external_id,
                    'attributes' => [
                        'name' => $user->name,
                        'email' => $user->email,
                        'created_at' => $user->created_at->toIso8601String(),
                    ],
                ],
                [
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'household' => [
                        'id' => $tenant->id,
                        'name' => $tenant->name,
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('User registration failed', [
                'error' => $e->getMessage(),
                'email' => $request->email,
            ]);

            return $this->errorResponse(
                'Registration Failed',
                'Unable to create user account. Please try again.',
                500
            );
        }
    }

    /**
     * Login user.
     *
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     summary="Login user",
     *     tags={"Authentication"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Login successful")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $userModel = config('tenant-engine.models.user');
        $user = $userModel::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return $this->unauthorizedResponse('Invalid credentials');
        }

        // Ensure active household tenant exists
        $tenant = $user->tenants()->wherePivot('status', 'active')->first();
        if (! $tenant) {
            $tenantId = 'hsh_' . strtolower(\Illuminate\Support\Str::random(8));
            $tenant = \Alamia\Core\Tenant\Models\Tenant::create([
                'id' => $tenantId,
                'name' => $user->name . "'s Household",
                'status' => 'active',
            ]);
            \App\Models\TenantMembership::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'is_owner' => true,
                'status' => 'active',
                'joined_at' => now(),
            ]);

            if (class_exists(\Modules\Grocery\Models\GroceryList::class)) {
                $groceryList = \Modules\Grocery\Models\GroceryList::create([
                    'tenant_id' => $tenant->id,
                    'name' => 'Weekly Essentials',
                    'icon' => 'cart',
                    'color' => '#0d6b68',
                ]);

                if (class_exists(\Modules\Grocery\Models\GroceryItem::class)) {
                    $defaultItems = [
                        ['name' => 'Fresh Milk', 'quantity' => 2, 'unit' => 'liters', 'category' => 'Dairy'],
                        ['name' => 'Eggs (Dozen)', 'quantity' => 1, 'unit' => 'dozen', 'category' => 'Dairy'],
                        ['name' => 'White Bread / Roti', 'quantity' => 1, 'unit' => 'pack', 'category' => 'Bakery'],
                        ['name' => 'Basmati Rice', 'quantity' => 2, 'unit' => 'kg', 'category' => 'Pantry'],
                        ['name' => 'Cooking Oil / Ghee', 'quantity' => 1, 'unit' => 'liters', 'category' => 'Pantry'],
                        ['name' => 'Tea / Chai Patti', 'quantity' => 1, 'unit' => 'pack', 'category' => 'Pantry'],
                        ['name' => 'Sugar / Shakkar', 'quantity' => 1, 'unit' => 'kg', 'category' => 'Pantry'],
                        ['name' => 'Potatoes (Aloo)', 'quantity' => 2, 'unit' => 'kg', 'category' => 'Produce'],
                        ['name' => 'Onions (Pyaz)', 'quantity' => 2, 'unit' => 'kg', 'category' => 'Produce'],
                        ['name' => 'Dishwashing Soap', 'quantity' => 1, 'unit' => 'bottle', 'category' => 'Household'],
                    ];

                    foreach ($defaultItems as $idx => $item) {
                        \Modules\Grocery\Models\GroceryItem::create([
                            'tenant_id' => $tenant->id,
                            'grocery_list_id' => $groceryList->id,
                            'name' => $item['name'],
                            'quantity' => $item['quantity'],
                            'unit' => $item['unit'],
                            'category' => $item['category'],
                            'is_checked' => false,
                            'sort_order' => $idx,
                        ]);
                    }
                }
            }
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return (new UserResource($user))->additional([
            'meta' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'household' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                ],
            ],
        ])->response();
    }

    /**
     * Login super admin.
     *
     * @OA\Post(
     *     path="/api/v1/auth/super-admin/login",
     *     summary="Login super admin",
     *     tags={"Authentication"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Login successful")
     * )
     */
    public function superAdminLogin(LoginRequest $request): JsonResponse
    {
        $adminModel = config('tenant-engine.models.super_admin');
        $admin = $adminModel::where('email', $request->email)->first();

        if (! $admin || ! Hash::check($request->password, $admin->password)) {
            return $this->unauthorizedResponse('Invalid credentials');
        }

        if (! $admin->isActive()) {
            return $this->forbiddenResponse('Your account is not active');
        }

        // Update last login
        $admin->updateLastLogin();

        // Create token
        $token = $admin->createToken('super-admin-token')->plainTextToken;

        return (new SuperAdminResource($admin))->additional([
            'meta' => [
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ])->response();
    }

    /**
     * Logout user.
     *
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     summary="Logout user",
     *     tags={"Authentication"},
     *     security={{"sanctum":{}}},
     *
     *     @OA\Response(response=204, description="Logout successful")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->noContentResponse();
    }

    /**
     * Get authenticated user.
     *
     * @OA\Get(
     *     path="/api/v1/auth/me",
     *     summary="Get current user",
     *     tags={"Authentication"},
     *     security={{"sanctum":{}}},
     *
     *     @OA\Response(response=200, description="Current user details")
     * )
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenant = $user->tenants()->wherePivot('status', 'active')->first();

        return $this->successResponse(
            [
                'type' => 'users',
                'id' => $user->external_id,
                'attributes' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                    'created_at' => $user->created_at->toIso8601String(),
                ],
            ],
            200,
            [
                'household' => $tenant ? [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                ] : null,
            ]
        );
    }

    /**
     * Refresh token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->successResponse([
            'type' => 'tokens',
            'attributes' => [
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Forgot password.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // TODO: Implement password reset email logic

        return $this->successResponse([
            'type' => 'password-reset',
            'attributes' => [
                'message' => 'Password reset link sent to your email',
            ],
        ]);
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // TODO: Implement password reset logic

        return $this->successResponse([
            'type' => 'password-reset',
            'attributes' => [
                'message' => 'Password reset successfully',
            ],
        ]);
    }

    /**
     * Verify email.
     */
    public function verifyEmail(Request $request, $id, $hash): JsonResponse
    {
        $userModel = config('tenant-engine.models.user');
        $user = $userModel::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->email))) {
            return $this->forbiddenResponse('Invalid verification link');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse([
                'type' => 'email-verification',
                'attributes' => [
                    'message' => 'Email already verified',
                ],
            ]);
        }

        $user->markEmailAsVerified();

        return $this->successResponse([
            'type' => 'email-verification',
            'attributes' => [
                'message' => 'Email verified successfully',
            ],
        ]);
    }
}
