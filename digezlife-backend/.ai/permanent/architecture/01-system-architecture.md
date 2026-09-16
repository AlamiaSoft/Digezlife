# System Architecture

## Overview
Alamia SaaS Platform Starter uses a **Domain-Driven Design (DDD) Monolithic Kernel** (`alamia-core`), which serves as the foundational "Business Platform Kernel". 

## 1. Top-Level Layout
- **`apps/`**: Host Laravel applications (e.g. Admin, Tenant, API).
- **`packages/alamia-core/`**: The core platform kernel.
- **`modules/`**: Installable business capabilities (CRM, Booking, OTT, HRM, etc.) built on top of the kernel.

## 2. Kernel Domains (`alamia-core/src/`)
The core package is structured into isolated domains:
- **`Kernel`**: Bootstrapping (`DomainServiceProvider`), configuration, `Version.php`.
- **`Shared`**: Contracts, DTOs, Enums, Exceptions, Helpers, Traits, ValueObjects shared across domains.
- **`Tenant`**: Multi-tenancy setup, lifecycle, and tenant management.
- **`Identity`**: Authentication, SSO, API Tokens.
- **`Authorization`**: RBAC and ARBAC scaffolding.
- **`Administration`**: Super Admin and Tenant Management capabilities.
- **`Billing`**: Plans, Products, Subscriptions, Invoices.
- **`Audit`**: Activity logging and telemetry.
- **Future Placeholder Domains**: Developer, Support, Search, AI, Media, Observability.

## 3. Runtime & Infrastructure
- **Application Server**: `laravel/octane` + FrankenPHP (`dunglas/frankenphp:php8.3-alpine`).
- **Multi-tenancy**: `stancl/tenancy` — SQLite by default in dev/CI, PostgreSQL for production.
- **Queue / Scheduling**: Laravel Horizon (Horizon + Scheduler defined in `docker-compose.production.yml`).
- **Container Pattern**: Multi-stage Docker build. Non-root user (`laravel:1000`). Caches baked at image build time.

## 3. Standard Domain Structure
Within each domain, the internal layout is strictly standardized to enforce decoupling:
- `Actions/`
- `Commands/`
- `Config/` (e.g., `tenant.php`)
- `Contracts/` (Interfaces only)
- `DTOs/`
- `Enums/`
- `Events/`
- `Exceptions/`
- `Http/`
- `Infrastructure/` (Laravel-specific concrete implementations)
- `Jobs/`
- `Listeners/`
- `Models/`
- `Observers/`
- `Policies/`
- `Providers/` (Binds Contracts to Infrastructure)
- `Queries/`
- `Repositories/`
- `Resources/`
- `Rules/`
- `Services/`
- `Support/`
- `Database/Migrations/`
- `Tests/`

## 4. Architectural Rules
- **Dependency Direction**: Business Modules → Domains → Kernel → Shared.
- **Domain Event Bus**: Domains communicate via Events (e.g. `UserRegistered`), never via direct service injection across domain boundaries.
- **Contracts over Concretions**: Always bind interfaces in the `Providers/` layer. Never inject concrete implementations from other domains.
- **Public API Boundary**: Only what is documented in `docs/kernel-api.md` is stable. Everything else is internal implementation.
- **CI gates**: PHPStan must pass at configured level. Deptrac must report 0 violations. Both SQLite and PostgreSQL test suites must be green before tagging a release.
