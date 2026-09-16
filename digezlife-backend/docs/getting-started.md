# Getting Started with Alamia Kernel

This guide demonstrates how to install the `alamia/core` kernel into a fresh Laravel application and configure it.

## 1. Create a Fresh Laravel Application

Alamia relies on a standard Laravel installation. Create a new project:

```bash
composer create-project laravel/laravel workspace
cd workspace
```

## 2. Require Alamia Core

During development, you may use a path repository in your `composer.json` to link the kernel locally. Alternatively, require it directly from Packagist/GitHub if published.

```json
{
    "minimum-stability": "dev",
    "prefer-stable": true,
    "repositories": [
        {
            "type": "path",
            "url": "../../packages/alamia-core",
            "options": {
                "symlink": true
            }
        }
    ]
}
```

Then run:

```bash
composer require alamia/core
```

*(Note: Depending on your setup, you may need to require `spatie/laravel-permission` manually if it is missing from `amrshah/laravel-arbac` dependencies during discovery).*

## 3. Frontend Scaffolding

We recommend **Blade + Livewire** for building native applications without heavy JavaScript architectures.

```bash
composer require livewire/livewire
php artisan livewire:layout
```

## 4. Database Setup

Alamia comes with numerous migrations from its underlying packages (Tenancy, ARBAC, Settings, Notifications, Webhooks, etc.). First, publish all the vendor assets and configuration files:

```bash
php artisan vendor:publish --all
```

Then run the migrations:

```bash
php artisan migrate
```

Your database is now prepared with the necessary tables for Tenants, Domains, Audit Logs, Settings, Permissions, and Webhooks.

## 5. Model Configuration

Your `App\Models\User` must implement the required traits for Roles and Tenancy:

```php
use Spatie\Permission\Traits\HasRoles;
use Amrshah\Arbac\Traits\TenantAware;

class User extends Authenticatable
{
    use HasRoles, TenantAware;
    
    public function tenants()
    {
        return $this->belongsToMany(
            \Alamia\Core\Tenant\Models\Tenant::class,
            'tenant_user',
            'user_id',
            'tenant_id'
        )->withPivot('role')->withTimestamps();
    }
}
```

## 6. Business Modules

The core kernel supports dynamically loading external business modules from a `modules/` directory at the root of your application.
To enable autoloading for these modules, add them to your `composer.json`:

```json
    "autoload": {
        "psr-4": {
            "Modules\\": "modules/"
        }
    }
```

Then run: `composer dump-autoload`. Any valid module containing a `module.json` and a registered provider will be bootstrapped automatically by the `DomainServiceProvider`.
