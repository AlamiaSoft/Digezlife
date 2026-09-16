# Kernel Public API (Compatibility Promise)

This document explicitly defines the boundaries of the Alamia Core Kernel. Any namespace, contract, facade, command, event, or extension point not listed here is considered **internal implementation** and may change without notice.

## 1. Supported Interfaces (Contracts)
Currently, module authors may depend on and inject the following interfaces:
- `Alamia\Core\Kernel\Modules\ModuleLoader`

*(Note: Additional Contracts for Modules and Tenants are planned but not yet implemented.)*

## 2. Supported Facades
Module authors may use the following facades exported by the core:
- `Alamia\Core\ApiGateway\Facades\ApiGateway`
- `Alamia\Core\Audit\Facades\Audit`
- `Alamia\Core\Billing\Facades\Billing`
- `Alamia\Core\Configuration\Facades\Configuration`
- `Alamia\Core\FeatureFlags\Facades\Features`
- `Alamia\Core\Integrations\Facades\Webhooks`
- `Alamia\Core\Journeys\Facades\Journeys`
- `Alamia\Core\Licensing\Facades\Licensing`
- `Alamia\Core\Notifications\Facades\Notification`
- `Alamia\Core\Quota\Facades\Quotas`
- `Alamia\Core\Settings\Facades\Settings`
- `Alamia\Core\UsageMeter\Facades\UsageMeter`
- `Alamia\Core\Workflow\Facades\Workflow`

*(Note: For Tenancy, use Stancl Tenancy's native `tenant()` helper or facade, as `Alamia\Core\Tenant\Facades\Tenant` is not provided.)*

## 3. Supported Events
Currently, no core kernel events are broadcasted. Modules should rely on standard Laravel events or underlying package events (e.g., `Stancl\Tenancy\Events\TenantCreated`).

## 4. Extension Points & Business Modules
Modules can register new bindings in the Service Container by dropping a valid module into the `/modules` folder of the host app.
- **`module.json`**: Must provide `"id"`, `"name"`, `"version"`, and a list of `"providers"`.
- **Autoloading**: The host application's `composer.json` must map the `"Modules\\"` PSR-4 namespace to the `modules/` directory.

## 5. Artisan Commands
The Kernel provides the following commands for the Host Application to use:
- `php artisan alamia:install`
- `php artisan alamia:super-admin`
- `php artisan tenant:create`
- `php artisan tenant:migrate`
