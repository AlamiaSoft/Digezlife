# AI Workspace Instructions (AGENTS.md) - DigEzLife Backend

This file contains foundational rules for AI agents working in `digezlife-backend`.

## 1. Project Context
`digezlife-backend` is the Laravel 13 multi-tenant API backend for the DigEzLife household utility SaaS platform.

## 2. The AI Bootstrap Sequence
Follow this read order before inspecting code:
1. `.ai/README.md` (Master Index)
2. `.ai/transient/sprint/00-current-state.md`
3. `.ai/permanent/architecture/01-system-architecture.md`
4. `.ai/indexes/repository.md`
5. `.ai/permanent/standards/01-coding-standards.md`

## 3. Core Architectural Invariants
1. **Single-Database Tenancy**: Tenants represent Households. Data is isolated via `BelongsToTenant` trait and `tenant_id` scoping. Never re-enable `DatabaseTenancyBootstrapper` in `config/tenancy.php`.
2. **Pluggable Modules**: All business features must reside in `modules/<name>/` with a valid `module.json`, service provider, and PSR-4 namespace in `composer.json`.
3. **NanoID Security**: Never expose raw auto-incrementing integer IDs in public APIs. Always use `HasExternalId` trait (`USR_`, `HSH_`, `GLS_`, `GIT_`, `TXN_`, `DBT_`, `RMD_`).
4. **Strict No Emojis**: Never use emoji icons in documentation, code, test names, commit messages, or API responses.
5. **Pest Testing**: Every new endpoint or module must include dedicated Pest feature tests.
