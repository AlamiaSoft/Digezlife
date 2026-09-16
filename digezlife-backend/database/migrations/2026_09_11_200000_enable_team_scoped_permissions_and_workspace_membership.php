<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add max_seats to tenants table if missing
        if (Schema::hasTable('tenants') && ! Schema::hasColumn('tenants', 'max_seats')) {
            Schema::table('tenants', function (Blueprint $table) {
                $table->unsignedInteger('max_seats')->default(10)->after('status');
            });
        }

        // 2. Enhance tenant_user table with membership lifecycle fields
        if (Schema::hasTable('tenant_user')) {
            Schema::table('tenant_user', function (Blueprint $table) {
                if (! Schema::hasColumn('tenant_user', 'is_owner')) {
                    $table->boolean('is_owner')->default(false)->after('user_id');
                }
                if (! Schema::hasColumn('tenant_user', 'status')) {
                    $table->string('status', 20)->default('active')->after('is_owner');
                }
                if (! Schema::hasColumn('tenant_user', 'joined_at')) {
                    $table->timestamp('joined_at')->nullable()->after('status');
                }
                if (! Schema::hasColumn('tenant_user', 'invited_by')) {
                    $table->unsignedBigInteger('invited_by')->nullable()->after('joined_at');
                }
            });
        }

        // 3. Update Spatie tables for team-scoped RBAC (using string tenant_id)
        if (Schema::hasTable('roles') && ! Schema::hasColumn('roles', 'tenant_id')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->string('tenant_id', 255)->nullable()->after('id');
                $table->index('tenant_id', 'roles_tenant_id_index');
            });
        }

        // For SQLite or standard SQL: update model_has_roles table with tenant_id column
        if (Schema::hasTable('model_has_roles') && ! Schema::hasColumn('model_has_roles', 'tenant_id')) {
            Schema::table('model_has_roles', function (Blueprint $table) {
                $table->string('tenant_id', 255)->nullable()->after('role_id');
                $table->index('tenant_id', 'model_has_roles_tenant_id_index');
            });
        }

        // For Spatie model_has_permissions table: add tenant_id
        if (Schema::hasTable('model_has_permissions') && ! Schema::hasColumn('model_has_permissions', 'tenant_id')) {
            Schema::table('model_has_permissions', function (Blueprint $table) {
                $table->string('tenant_id', 255)->nullable()->after('permission_id');
                $table->index('tenant_id', 'model_has_permissions_tenant_id_index');
            });
        }

        // 4. Create tenant_invitations table
        if (! Schema::hasTable('tenant_invitations')) {
            Schema::create('tenant_invitations', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id', 255);
                $table->string('email');
                $table->string('role', 50)->default('member');
                $table->string('token', 64)->unique();
                $table->unsignedBigInteger('invited_by')->nullable();
                $table->timestamp('expires_at');
                $table->timestamp('accepted_at')->nullable();
                $table->timestamps();

                $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
                $table->foreign('invited_by')->references('id')->on('users')->nullOnDelete();
                $table->index(['tenant_id', 'email']);
                $table->index(['tenant_id', 'token']);
            });
        }

        // 5. Data Migration: Migrate existing tenant_user roles into Spatie team-scoped roles
        if (Schema::hasTable('tenant_user')) {
            $memberships = DB::table('tenant_user')->get();
            $now = now();

            foreach ($memberships as $membership) {
                $tenantId = (string) $membership->tenant_id;
                $userId = (int) $membership->user_id;
                $roleName = ! empty($membership->role) ? (string) $membership->role : 'member';
                $isOwner = in_array(strtolower($roleName), ['admin', 'owner', 'tenant_admin'], true);

                // Update tenant_user flags
                DB::table('tenant_user')->where('id', $membership->id)->update([
                    'is_owner' => $isOwner,
                    'status' => 'active',
                    'joined_at' => $membership->created_at ?? $now,
                ]);

                // Create or find Spatie role for this tenant
                $existingRole = DB::table('roles')
                    ->where('name', $roleName)
                    ->where('guard_name', 'web')
                    ->where('tenant_id', $tenantId)
                    ->first();

                if (! $existingRole) {
                    $roleId = DB::table('roles')->insertGetId([
                        'name' => $roleName,
                        'guard_name' => 'web',
                        'tenant_id' => $tenantId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                } else {
                    $roleId = $existingRole->id;
                }

                // Attach to model_has_roles
                $hasRoleAssignment = DB::table('model_has_roles')
                    ->where('role_id', $roleId)
                    ->where('model_id', $userId)
                    ->where('model_type', 'App\\Models\\User')
                    ->where('tenant_id', $tenantId)
                    ->exists();

                if (! $hasRoleAssignment) {
                    DB::table('model_has_roles')->insert([
                        'role_id' => $roleId,
                        'model_type' => 'App\\Models\\User',
                        'model_id' => $userId,
                        'tenant_id' => $tenantId,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_invitations');
    }
};
