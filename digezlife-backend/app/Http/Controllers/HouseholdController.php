<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\HouseholdPermission;
use App\Models\MemberActivityLog;
use App\Models\TenantInvitation;
use App\Models\TenantMembership;
use App\Models\User;
use App\Services\HouseholdPermissionService;
use App\Services\HouseholdSnapshotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HouseholdController extends Controller
{
    /**
     * Get the active household tenant for the authenticated user.
     */
    protected function getTenantForUser(Request $request, User $user): Tenant
    {
        $tenantId = $request->header('X-Tenant-ID') ?: $request->query('household_id');

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant && $user->canAccessTenant($tenant)) {
                return $tenant;
            }
        }

        /** @var Tenant|null $tenant */
        $tenant = $user->tenants()->wherePivot('status', 'active')->first();

        if (! $tenant) {
            // Auto-provision personal household if missing
            $tenantId = 'hsh_' . strtolower(Str::random(8));
            $tenant = Tenant::create([
                'id' => $tenantId,
                'name' => $user->name . "'s Household",
                'status' => 'active',
                'max_seats' => 5,
            ]);

            TenantMembership::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'is_owner' => true,
                'status' => 'active',
                'joined_at' => now(),
            ]);
        }

        return $tenant;
    }

    /**
     * List all active members and pending invitations for the household.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        // 1. Fetch real active members
        $members = $tenant->users()
            ->wherePivot('status', 'active')
            ->get()
            ->map(function (User $u) use ($user) {
                $isOwner = (bool) $u->pivot->is_owner;
                $role = $isOwner ? 'owner' : ($u->pivot->role ?? 'member');

                return [
                    'id' => (string) $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone ?? null,
                    'role' => $role,
                    'roleTitle' => $isOwner ? 'Head of Household' : ($role === 'admin' ? 'Household Admin' : 'Family Member'),
                    'joinedAt' => $u->pivot->joined_at ? Carbon::parse($u->pivot->joined_at)->toFormattedDateString() : 'Active',
                    'isCurrent' => $u->id === $user->id,
                    'avatarColor' => $isOwner ? 'var(--wa-color-brand-fill-quiet)' : 'var(--wa-color-blue-90)',
                    'avatarText' => $isOwner ? 'var(--wa-color-brand-on-quiet)' : 'var(--wa-color-blue-40)',
                ];
            });

        // 2. Fetch real pending invitations
        $pendingInvites = TenantInvitation::where('tenant_id', $tenant->id)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->get()
            ->map(function (TenantInvitation $inv) {
                return [
                    'id' => (string) $inv->id,
                    'recipient' => $inv->email,
                    'role' => $inv->role,
                    'roleTitle' => $inv->role === 'admin' ? 'Household Admin' : 'Family Member',
                    'sentAt' => $inv->created_at ? $inv->created_at->diffForHumans() : 'Recently',
                    'expiresIn' => $inv->expires_at ? $inv->expires_at->diffForHumans(null, true) : '7 days',
                    'token' => $inv->token,
                    'inviteUrl' => "https://gharlyapp.alamiaconnect.com/#/join?code={$inv->token}",
                ];
            });

        $maxSeats = $tenant->max_seats ?? 5;

        return response()->json([
            'data' => [
                'household' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'plan' => $tenant->plan ?? 'free',
                    'maxSeats' => $maxSeats,
                    'activeCount' => $members->count(),
                    'pendingCount' => $pendingInvites->count(),
                ],
                'members' => $members,
                'pendingInvites' => $pendingInvites,
            ],
        ]);
    }

    /**
     * Create and issue a real household invitation.
     */
    public function invite(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $validated = $request->validate([
            'recipient' => 'required|string|max:255',
            'role' => 'nullable|string|in:member,admin',
        ]);

        $recipient = trim($validated['recipient']);
        $role = $validated['role'] ?? 'member';

        // Check seat capacity
        if (! $tenant->hasAvailableSeats()) {
            return response()->json([
                'message' => 'Your household has reached its maximum member capacity. Upgrade to Family Plus to invite more members.',
            ], 422);
        }

        // Cancel existing pending invite to same recipient if any
        TenantInvitation::where('tenant_id', $tenant->id)
            ->where('email', $recipient)
            ->whereNull('accepted_at')
            ->delete();

        $token = 'gharly_inv_' . strtolower(Str::random(12));

        $invitation = TenantInvitation::create([
            'tenant_id' => $tenant->id,
            'email' => $recipient,
            'role' => $role,
            'token' => $token,
            'invited_by' => $user->id,
            'expires_at' => now()->addDays(7),
        ]);

        $inviteUrl = "https://gharlyapp.alamiaconnect.com/#/join?code={$token}";

        return response()->json([
            'message' => "Invitation created for {$recipient}",
            'data' => [
                'id' => (string) $invitation->id,
                'recipient' => $invitation->email,
                'role' => $invitation->role,
                'roleTitle' => $invitation->role === 'admin' ? 'Household Admin' : 'Family Member',
                'token' => $token,
                'inviteUrl' => $inviteUrl,
                'expiresIn' => '7 days',
                'sentAt' => 'Just now',
            ],
        ], 201);
    }

    /**
     * Accept a household invitation and join.
     */
    public function join(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'code' => 'required|string|max:64',
        ]);

        $code = trim($validated['code']);

        /** @var TenantInvitation|null $invitation */
        $invitation = TenantInvitation::where('token', $code)->first();

        if (! $invitation) {
            // Check if code matches a direct tenant ID
            $tenant = Tenant::find($code);
            if ($tenant) {
                if ($user->canAccessTenant($tenant)) {
                    return response()->json([
                        'message' => "You are already a member of {$tenant->name}",
                        'data' => [
                            'household' => [
                                'id' => $tenant->id,
                                'name' => $tenant->name,
                            ],
                        ],
                    ]);
                }

                $membership = $tenant->addMember($user, 'member', false);

                return response()->json([
                    'message' => "Successfully joined {$tenant->name}!",
                    'data' => [
                        'household' => [
                            'id' => $tenant->id,
                            'name' => $tenant->name,
                        ],
                    ],
                ]);
            }

            return response()->json([
                'message' => 'Invalid or expired invitation code.',
            ], 404);
        }

        if ($invitation->isExpired()) {
            return response()->json([
                'message' => 'This invitation link has expired. Please ask the household owner to send a new invite.',
            ], 422);
        }

        if ($invitation->isAccepted()) {
            $tenant = $invitation->tenant;
            return response()->json([
                'message' => "This invitation was already accepted.",
                'data' => [
                    'household' => [
                        'id' => $tenant?->id,
                        'name' => $tenant?->name,
                    ],
                ],
            ]);
        }

        $membership = $invitation->accept($user);
        $tenant = $invitation->tenant;

        return response()->json([
            'message' => "Welcome to {$tenant->name}!",
            'data' => [
                'household' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'role' => $membership->role ?? 'member',
                ],
            ],
        ]);
    }

    /**
     * Cancel/revoke a pending invitation.
     */
    public function cancelInvite(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $invitation = TenantInvitation::where('tenant_id', $tenant->id)->where('id', $id)->first();

        if ($invitation) {
            $invitation->delete();
        }

        return response()->json([
            'message' => 'Invitation cancelled successfully.',
        ]);
    }

    /**
     * Remove a member from the household.
     */
    public function removeMember(Request $request, string $userId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        // Cannot remove oneself if owner
        if ((string) $user->id === $userId) {
            return response()->json(['message' => 'You cannot remove yourself from your own household.'], 422);
        }

        $targetMembership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $userId)
            ->first();

        if (! $targetMembership) {
            return response()->json(['message' => 'Member not found.'], 404);
        }

        if ($targetMembership->is_owner) {
            return response()->json(['message' => 'Cannot remove the household head.'], 422);
        }

        $targetMembership->delete();

        return response()->json([
            'message' => 'Member removed from household.',
        ]);
    }

    /**
     * Get the current user's capabilities in the household.
     */
    public function myCapabilities(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $permService = app(HouseholdPermissionService::class);
        $capabilities = $permService->getCapabilities($tenant->id, $user->id);

        $membership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)->first();

        return response()->json([
            'data' => [
                'is_owner' => (bool) ($membership?->is_owner ?? false),
                'role' => $membership?->getRoleAttribute() ?? 'member',
                'capabilities' => $capabilities,
            ],
        ]);
    }

    /**
     * Update a member's role.
     */
    public function updateMemberRole(Request $request, string $userId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $requesterMembership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)->first();
        if (!$requesterMembership?->is_owner && $requesterMembership?->getRoleAttribute() !== 'admin') {
            return response()->json(['message' => 'Only admins can change member roles.'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|string|in:admin,manager,viewer,member',
        ]);

        $targetMembership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $userId)->first();
        if (!$targetMembership) {
            return response()->json(['message' => 'Member not found.'], 404);
        }
        if ($targetMembership->is_owner) {
            return response()->json(['message' => 'Cannot change the household owner role.'], 422);
        }

        $permService = app(HouseholdPermissionService::class);
        $permService->syncCapabilities($tenant->id, (int)$userId, HouseholdPermission::defaultsForRole($validated['role']));

        MemberActivityLog::record($tenant->id, $user->id, (int)$userId, 'role_changed', ['old_role'=>$targetMembership->getRoleAttribute(), 'new_role'=>$validated['role']]);

        return response()->json(['message' => 'Role updated successfully.']);
    }

    /**
     * Get a member's capabilities.
     */
    public function getMemberCapabilities(Request $request, string $userId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $permService = app(HouseholdPermissionService::class);
        $capabilities = $permService->getCapabilities($tenant->id, (int)$userId);

        return response()->json(['data' => ['user_id' => $userId, 'capabilities' => $capabilities]]);
    }

    /**
     * Update a member's capabilities.
     */
    public function updateMemberCapabilities(Request $request, string $userId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $requesterMembership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)->first();
        if (!$requesterMembership?->is_owner && $requesterMembership?->getRoleAttribute() !== 'admin') {
            return response()->json(['message' => 'Only admins can manage permissions.'], 403);
        }

        $validated = $request->validate([
            'capabilities' => 'required|array',
            'capabilities.*' => 'string|in:' . implode(',', HouseholdPermission::allCapabilities()),
        ]);

        $permService = app(HouseholdPermissionService::class);
        $permService->syncCapabilities($tenant->id, (int)$userId, $validated['capabilities']);

        MemberActivityLog::record($tenant->id, $user->id, (int)$userId, 'permission_changed', ['capabilities'=>$validated['capabilities']]);

        return response()->json(['message' => 'Permissions updated successfully.']);
    }

    /**
     * Get household member activity log.
     */
    public function activityLog(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $logs = MemberActivityLog::where('tenant_id', $tenant->id)
            ->latest('created_at')
            ->limit(50)
            ->with(['actor:id,name', 'target:id,name'])
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'actor' => $log->actor?->name ?? 'System',
                'target' => $log->target?->name,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at?->diffForHumans(),
            ]);

        return response()->json(['data' => $logs]);
    }

    /**
     * Clear the activity feed (hide items older than now).
     */
    public function clearActivityFeed(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $scope = $request->input('scope', 'personal');

        if ($scope === 'household') {
            $membership = TenantMembership::where('tenant_id', $tenant->id)
                ->where('user_id', $user->id)->first();
                
            if (!$membership?->is_owner) {
                return response()->json(['message' => 'Only the household owner can clear the feed for everyone.'], 403);
            }
            $tenant->update(['activity_feed_cleared_at' => now()]);
        } else {
            TenantMembership::where('tenant_id', $tenant->id)
                ->where('user_id', $user->id)
                ->update(['activity_feed_cleared_at' => now()]);
        }

        return response()->json(['message' => 'Activity feed cleared.']);
    }

    /**
     * Dismiss an individual activity from the feed.
     */
    public function dismissActivity(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $validated = $request->validate([
            'id' => 'required|string',
            'scope' => 'nullable|string|in:personal,household',
        ]);

        $scope = $validated['scope'] ?? 'personal';
        $activityId = $validated['id'];

        if ($scope === 'household') {
            $membership = TenantMembership::where('tenant_id', $tenant->id)
                ->where('user_id', $user->id)->first();
                
            if (!$membership?->is_owner) {
                return response()->json(['message' => 'Only the household owner can delete activities for everyone.'], 403);
            }
            
            // If it's a real MemberActivityLog ID
            if (is_numeric($activityId)) {
                $log = MemberActivityLog::where('tenant_id', $tenant->id)->find($activityId);
                if ($log) $log->delete(); // soft delete
            } else {
                // To support composite IDs (e.g. hisab-1), just store it in the tenant's metadata or we skip for now since it's hard. Wait, actually, let's just let household clears be full clears, and individual dismissals be personal. Or we could track a global dismissed array on the tenant.
                // For now, let's store it on the personal membership since global dismissal of individual dynamic items would require a JSON column on Tenant.
                return response()->json(['message' => 'Household-wide deletion is supported via clearing the entire feed or soft-deleting the actual item. Please use personal dismissal.'], 400);
            }
        } else {
            $membership = TenantMembership::where('tenant_id', $tenant->id)
                ->where('user_id', $user->id)->first();
                
            $dismissed = is_array($membership->dismissed_activities) ? $membership->dismissed_activities : [];
            if (!in_array($activityId, $dismissed)) {
                $dismissed[] = $activityId;
                TenantMembership::where('tenant_id', $tenant->id)
                    ->where('user_id', $user->id)
                    ->update(['dismissed_activities' => json_encode($dismissed)]);
            }
        }

        return response()->json(['message' => 'Activity dismissed.']);
    }

    /**
     * Get feed settings for the current user.
     */
    public function feedSettings(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $membership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)->first();

        return response()->json([
            'data' => [
                'tenant_cleared_at' => $tenant->activity_feed_cleared_at,
                'personal_cleared_at' => $membership?->activity_feed_cleared_at,
                'dismissed_activities' => $membership?->dismissed_activities ?? [],
                'is_owner' => (bool) $membership?->is_owner,
            ],
        ]);
    }

    /**
     * Get unified household snapshot for the active household.
     */
    public function snapshot(Request $request, HouseholdSnapshotService $snapshotService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);
        $month = $request->input('month');

        $data = $snapshotService->getSnapshot($tenant, $user, $month);

        $clientRevision = $request->header('If-None-Match') ?: $request->input('revision');
        if ($clientRevision && $clientRevision === $data['revision']) {
            return response()->json([
                'status' => 'not_modified',
                'revision' => $data['revision'],
            ], 304);
        }

        return response()->json([
            'data' => $data,
        ])->header('ETag', $data['revision']);
    }

    /**
     * Update household settings (e.g. name).
     */
    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $membership = TenantMembership::where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $membership || (! $membership->is_owner && $membership->role !== 'admin')) {
            return response()->json([
                'message' => 'Unauthorized to update household settings',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
        ]);

        $tenant->update([
            'name' => $validated['name'],
        ]);

        MemberActivityLog::record($tenant->id, $user->id, null, 'household_updated', [
            'name' => $validated['name'],
        ]);

        return response()->json([
            'message' => 'Household updated successfully',
            'data' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
        ]);
    }

    /**
     * Redeem a promo code to activate a subscription plan.
     */
    public function redeemPromoCode(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $tenant = $this->getTenantForUser($request, $user);

        $validated = $request->validate([
            'code' => 'required|string|max:50',
        ]);

        $code = strtoupper(trim($validated['code']));

        $promoPlans = [
            'LAUNCH2026' => ['plan' => 'plus', 'duration_days' => 365, 'label' => '1 Year Plus Family'],
            'EARLYBIRD'  => ['plan' => 'plus', 'duration_days' => 180, 'label' => '6 Months Plus Family'],
            'GHARLYVIP'  => ['plan' => 'vip',  'duration_days' => 365, 'label' => '1 Year VIP Household'],
            'GHARLY30'   => ['plan' => 'plus', 'duration_days' => 30,  'label' => '30 Days Plus Trial'],
            'FREEPLUS'   => ['plan' => 'plus', 'duration_days' => 90,  'label' => '3 Months Plus Family'],
        ];

        if (! isset($promoPlans[$code])) {
            return response()->json([
                'message' => 'Invalid or expired promo voucher code. Please check and try again.',
            ], 422);
        }

        $promo = $promoPlans[$code];
        $endsAt = now()->addDays($promo['duration_days']);

        $tenant->update([
            'plan' => $promo['plan'],
            'subscription_ends_at' => $endsAt,
        ]);

        MemberActivityLog::record($tenant->id, $user->id, null, 'plan_activated', [
            'code' => $code,
            'plan' => $promo['plan'],
            'expires_at' => $endsAt->toIso8601String(),
        ]);

        return response()->json([
            'message' => "Congratulations! {$promo['label']} has been activated for your household.",
            'data' => [
                'plan' => $tenant->plan,
                'subscription_ends_at' => $endsAt->toIso8601String(),
                'expires_formatted' => $endsAt->format('d M Y'),
                'promo' => $promo['label'],
            ],
        ]);
    }
}



