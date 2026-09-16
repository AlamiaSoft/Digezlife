# Developer Experience (DX) Review

This artifact tracks the developer experience and friction encountered while building the Reference Application (`examples/workspace`) during Phase 3.6B.

## Kernel Modifications

Track any changes made to `alamia-core` required to support the host application.

| Issue | Public API Missing? | Kernel Changed? | Justification |
| ----- | ------------------- | --------------- | ------------- |
| Missing Role implementation | No, but RBAC was incomplete | Yes (`composer.json`) | Added `spatie/laravel-permission` to `alamia-core` because the ARBAC package lacks basic Role CRUD, requiring direct Spatie dependency. |

## Friction Points

### Phase 3.6B: Workspace Integration (Live)

### Milestone 1: Core Setup
*   **Missing Facade:** The `alamia/core` composer package exposes an alias `"AlamiaCore": "Alamia\\Core\\Facades\\AlamiaCore"` but this class does not exist in the codebase.
*   **Tenancy Migration Collision:** By default, running `php artisan vendor:publish` publishes `stancl/tenancy` migrations directly into `database/migrations` (e.g. `2019_09_15_000010_create_tenants_table.php`). This overrides the `alamia-core` migration located in `src/Database/Migrations/central` because they share the same name, resulting in a missing `deleted_at` column. However, deleting the `stancl/tenancy` ones also removes the `domains` and `impersonation_tokens` tables because `alamia-core` does not ship them natively. **Action:** `alamia-core` should package all required central migrations (including domains) so that `stancl/tenancy` migrations do not need to be published by the user.
*   **Route Interception by Stancl/Tenancy:** When `stancl/tenancy` is published, its `routes/tenant.php` registers a `Route::get('/')` wrapped in a `PreventAccessFromCentralDomains` middleware. This maps to the central application's route group in tests, overriding `routes/web.php` and returning a `404 Not Found` for the root route. **Action:** Developers need clear guidance (or an automated setup command in `alamia-core`) to remove the conflicting root route in `routes/tenant.php` upon installation.

### Milestone 2: Authentication & Invitations
*   **Broken RoleController in Core:** The `Alamia\Core\Controllers\API\V1\Tenant\RoleController` calls non-existent methods on the ARBAC facade (`Arbac::getRoles()`, `Arbac::createRole()`, `Arbac::getRole()`). The `ArbacManager` in `amrshah/laravel-arbac` only has methods for assigning/removing/checking roles and permissions, not for CRUD operations on the Role model itself. **Action:** `RoleController` needs to be rewritten to use `Spatie\Permission\Models\Role` directly, or the ARBAC manager needs these methods implemented.

| Step | Difficulty | Notes |
| ---- | ---------- | ----- |
|      |            |       |

As part of Sprint 3.6.2.5, we've compiled actual metrics and observations based on our experience bootstrapping the `examples/workspace` host application.

## 1. Quantitative Metrics

- **Install Time:** ~2 minutes (Running `composer create-project`, requiring `alamia/core`, publishing assets, running migrations).
- **Configuration Edits:** 1 file (`composer.json` required manual setup to map `Modules\\` and register path repositories).
- **Time to First Tenant:** ~5 minutes (Creating `Register` Volt component and wiring auth logic).
- **Kernel Code Modifications Required:** **1 minor change**. We successfully built the host application without modifying any PHP source code in `alamia-core`. We only had to add `spatie/laravel-permission` to `composer.json` to fix a broken Roles dependency.

## 2. Qualitative Observations

### What Went Well (Frictionless)
1. **Migration Publishing:** `php artisan vendor:publish --all` reliably exported everything needed (ARBAC, Tenancy, Notifications).
2. **Module Autoloading:** Hooking up `HelloModule` was seamless. Standard Laravel autoloading combined with the Kernel's `DomainServiceProvider` worked flawlessly.
3. **Frontend Flexibility:** Sticking to Blade + Livewire in the host app meant we bypassed complex API/SPA auth setups, vastly reducing complexity.

### Points of Friction (Opportunities for Improvement)
1. **Implicit Contracts/Facades:** Many abstractions documented in `kernel-api.md` (e.g., `TenantInterface`, `Tenant` Facade) do not exist. Developers are forced to rely on the underlying packages directly (e.g., Stancl's `tenant()` helper) which technically violates the encapsulation boundary.
2. **Missing CLI Generators:** Creating standard elements like Settings requires remembering Spatie's syntax (`php artisan make:settings`) instead of unified `alamia:` namespace commands.
3. **Undocumented Dependencies:** We had to manually discover that adding `HasRoles` and `TenantAware` traits to the `User` model was necessary.

## 3. Conclusion

The Host Application strategy has proven that the **Alamia Core is highly capable and production-ready for consumption**. While the public API boundaries need tightening before v1.0, the core foundation (database schemas, middleware, multi-tenancy, and module loading) is stable and robust.
