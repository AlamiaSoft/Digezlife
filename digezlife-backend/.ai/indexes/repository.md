# Repository Index

## Core Architecture
The application follows a modular monolith architecture.
All platform features are packaged into `packages/alamia-core`.
All external business logic should live in `modules/`.

## Alamia Core Package (`packages/alamia-core`)
Built around strict Domain-Driven Design (DDD) principles. Each domain is isolated into its own folder structure.

### Active Domains:
- **ApiGateway**: API routing, authentication (Sanctum), and rate limiting.
- **Audit**: Tracks platform activity using `spatie/laravel-activitylog`.
- **Billing**: Manages plans and subscriptions.
- **Configuration**: Immutable application configurations.
- **FeatureFlags**: Feature rollout and capability checks using `laravel/pennant`.
- **Integrations**: Unified platform integrations including Webhooks (via Spatie), OAuth, and external Connectors.
- **Journeys**: Generic state-tracking engine for tenant onboarding, user onboarding, upgrade flows, and guides.
- **Kernel**: Core service providers (`AlamiaCoreServiceProvider`, `DomainServiceProvider`), Module loading (`FilesystemLoader`, `ModuleLoader`, `ModuleManifest`, `ModuleRegistry`), and shared base classes.
- **Licensing**: Core platform licensing.
- **Notifications**: Multi-channel notification dispatching.
- **Quota**: Hard resource limits tracking (`alamia_quotas` table).
- **Settings**: Mutable runtime configurations using `spatie/laravel-settings`.
- **UsageMeter**: Tracks consumption metrics against quotas (`alamia_usages` table).
- **Workflow**: Native event-bus orchestration.

## Packages and Third-Party Rules
Alamia heavily relies on mature Laravel community packages to avoid reinventing the wheel.
All packages **must** be abstracted behind Alamia's internal Service classes and Facades to maintain decoupling.

**Key Libraries**:
- Multi-tenancy: `stancl/tenancy`
- Settings: `spatie/laravel-settings`
- Feature Flags: `laravel/pennant`
- Activity Logs: `spatie/laravel-activitylog`
- API Auth: `laravel/sanctum`
- App Server: `laravel/octane` (FrankenPHP)

## Docker & Deployment
- **Base image**: `dunglas/frankenphp:php8.3-alpine` via multi-stage Dockerfile
- **docker-compose.yml**: Infrastructure only (Postgres, Redis, Networks, Volumes)
- **docker-compose.local.yml**: App service (FrankenPHP/Octane on port 8000), Mailpit
- **docker-compose.production.yml**: App, Horizon, Scheduler production overrides
- **Build strategy**: Never build on VPS. Use GitHub Actions → GHCR → Portainer pull.

## CI/CD
- **ci.yml**: Runs PHPStan + tests on SQLite (every push) and PostgreSQL (scheduled).
- **release.yml**: Builds and pushes Docker image to GHCR when a `v*` tag is pushed.

## Tests
- `tests/Platform/` — Kernel boot, module loading, tenant lifecycle (platform-level smoke tests)
- `tests/Integration/` — Route, auth, authorization, isolation, and tenant resolution tests
- `tests/Architecture/` — Deptrac domain boundary enforcement
- `phpunit.pgsql.xml` — PostgreSQL-specific test configuration

## Developer Tooling
- We use the `laravel-boost` MCP server for deep insight into framework architecture (routes, container bindings, configs, etc.)
- `composer/semver` ensures that modules declare strict dependencies on `alamia/core` versions.
- PHPStan (Level 5+) via `phpstan.neon` with a baseline in `phpstan-baseline.neon`.
- PHP-CS-Fixer / Pint via `pint.json` for code style enforcement.
- Deptrac via `deptrac.yaml` for domain boundary enforcement.

## Documentation
- `docs/kernel-api.md` — **Kernel Public API Contract**: the stable surface area for module authors.
- `docs/release-checklist.md` — Steps required before tagging a release.
- `docs/versioning.md` — SemVer policy; only `docs/kernel-api.md` surface is semver-guaranteed.
- `docs/ai-feedback-qa/` — Historical design decisions, phase reviews, and AI feedback.

## Examples
- `examples/workspace/README.md` — How to build a workspace module.
- `examples/booking/README.md` — How to build a booking/scheduling module.
- `examples/crm/README.md` — How to build a CRM module.
