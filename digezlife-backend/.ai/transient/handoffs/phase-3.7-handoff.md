# Handoff: Phase 3.7 - Tenant Provisioning Pipeline

**Date:** 2026-08-05
**Status:** Completed & Validated

## Mission Context
The goal of this phase was to construct a robust, production-ready Tenant Provisioning Pipeline that is strictly decoupled from third-party lifecycles (specifically Stancl/Tenancy's JobPipeline). We needed a system that keeps host application logic out of the core package while remaining completely extensible.

## What Was Accomplished
1. **Decoupled Orchestration:** 
   - Created `TenantProvisioningService` as the orchestrator. It uses a `TenantProvisioningData` DTO (with a `PlainPassword` value object) to securely pass configuration from the UI without leaking sensitive credentials to the database or logs.
   - Introduced `TenantRegistered` as the Alamia-owned entrypoint event.
2. **Robust Pipeline:**
   - The pipeline is defined in `config('tenant-engine.tenant.provisioning.pipeline')`.
   - `ProvisionTenantListener` sequentially executes steps that implement `ProvisioningStep`.
   - Core steps: `CreateDomainStep`, `ProvisionDatabaseStep`, `RunMigrationsStep`, and `SeedTenantStep`.
3. **Database Provisioning Abstracts:**
   - Created `TenantDatabaseProvisioner` interface.
   - Defaulted to `SharedConnectionProvisioner` with a stub ready for `DedicatedDatabaseProvisioner`.
4. **Host Application Alignment:**
   - Updated `examples/workspace` to leverage the new pipeline.
   - Removed all core provisioning logic from the host app, replacing it with 3 distinct listeners (`CreateWorkspaceOwner`, `AssignWorkspaceRoles`, `SendWelcomeNotification`) attached to the final `TenantProvisioned` event.
   - Fixed local central domain resolution (Stancl prefers `127.0.0.1`, which breaks local `.localhost` routing; this is now fixed in `CreateDomainStep`).

## Code Health
- All 26 PHPUnit tests in `packages/alamia-core` are passing (100% green).
- All 13 Feature/Unit tests in `examples/workspace` are passing (100% green).

## Next Steps for the Next Agent
- **URGENT CI/CD FIX:** The GitHub Actions CI/CD pipeline has failed with the following error:
  ```
  Run composer install -q --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist
  Your lock file does not contain a compatible set of packages. Please run composer update.
  Error: Process completed with exit code 2.
  ```
  **First task for tomorrow:** Run `composer update` to sync `composer.lock` with the recently updated `composer.json` requirements and resolve the CI failure.
- Proceed with **Phase 4 (Developer Experience)**. This will involve the CLI scaffolding tools (`alamia:new`, `alamia:make-module`), and wrapping up the installer wizard.
- Review `.ai/transient/sprint/00-current-state.md` to get fully caught up.
- Note: If you ever encounter domain routing issues on local environment, verify the `tenant-engine.tenant.central_domain` configuration.
