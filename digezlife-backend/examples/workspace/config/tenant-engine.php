<?php

return [

    /*
    |--------------------------------------------------------------------------
    | AlamiaCore Enabled
    |--------------------------------------------------------------------------
    |
    | Enable or disable the AlamiaCore package. When disabled, all
    | multi-tenancy features will be bypassed.
    |
    */

    'enabled' => env('TENANT_ENGINE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | External ID Prefixes
    |--------------------------------------------------------------------------
    |
    | Define custom prefixes for external IDs. These are used to generate
    | unique, non-sequential IDs for resources (e.g., USR_xxx, TNT_xxx).
    |
    */

    'external_id_prefixes' => [
        'users' => 'USR',
        'tenants' => 'TNT',
        'super_admins' => 'SAD',
        'oauth_providers' => 'OAP',
        'audit_logs' => 'AUD',
        // Add your custom prefixes here
    ],

    /*
    |--------------------------------------------------------------------------
    | External ID Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Nano ID generation.
    |
    */

    'external_id' => [
        'length' => 14,
        'alphabet' => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        'max_retries' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | API Configuration
    |--------------------------------------------------------------------------
    |
    | General API settings including versioning and rate limiting.
    |
    */

    'api' => [
        'version' => '1.0.0',
        'prefix' => 'api',
        'latest_version' => 'v1',

        // Deprecated API versions with sunset information
        'deprecated_versions' => [
            // Example: 'v0' => [
            //     'sunset_date' => '2025-06-01',
            //     'migration_guide' => 'https://docs.example.com/migration/v0-to-v1',
            // ],
        ],

        'rate_limits' => [
            'unauthenticated' => env('API_RATE_LIMIT_GUEST', 60),
            'authenticated' => env('API_RATE_LIMIT', 1000),
            'tenant' => env('API_RATE_LIMIT_TENANT', 10000),
            'super_admin' => env('API_RATE_LIMIT_SUPER_ADMIN', 50000),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | OAuth Providers
    |--------------------------------------------------------------------------
    |
    | Supported OAuth providers for social authentication.
    |
    */

    'oauth' => [
        'providers' => ['google', 'microsoft', 'linkedin', 'facebook'],

        'redirect_after_login' => env('OAUTH_REDIRECT_URL', '/dashboard'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Configuration
    |--------------------------------------------------------------------------
    |
    | Settings related to tenant management and database isolation.
    |
    */

    'tenant' => [
        'database_prefix' => env('TENANT_DB_PREFIX', 'tenant_'),
        'default_plan' => 'free',
        'default_status' => 'active',

        'auto_create_database' => true,
        'auto_run_migrations' => true,
        'auto_seed_database' => false,
        'delete_database_on_delete' => false,

        /*
        |----------------------------------------------------------------------
        | Provisioning Pipeline
        |----------------------------------------------------------------------
        |
        | An ordered list of ProvisioningStep classes to execute when a new
        | tenant is registered. Steps run synchronously in order.
        |
        | Each step must implement Alamia\Core\Tenant\Contracts\ProvisioningStep
        | and must be idempotent (safe to run more than once).
        |
        | Plugins and modules can append steps here without touching kernel code:
        |   config(['tenant-engine.tenant.provisioning.pipeline' => array_merge(
        |       config('tenant-engine.tenant.provisioning.pipeline'),
        |       [YourCustomStep::class]
        |   )]);
        |
        */
        'provisioning' => [
            'pipeline' => [
                Alamia\Core\Tenant\Jobs\CreateDomainStep::class,
                Alamia\Core\Tenant\Jobs\ProvisionDatabaseStep::class,
                Alamia\Core\Tenant\Jobs\RunMigrationsStep::class,
                Alamia\Core\Tenant\Jobs\SeedTenantStep::class,
            ],
        ],

        'slug' => [
            'min_length' => 3,
            'max_length' => 50,
            'reserved' => [
                'api', 'admin', 'super-admin', 'www', 'mail', 'ftp',
                'localhost', 'staging', 'production', 'test', 'demo',
                'app', 'web', 'mobile', 'ios', 'android', 'dashboard',
                'auth', 'login', 'register', 'logout', 'password',
                'health', 'ping', 'version', 'status', 'docs', 'swagger',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Super Admin Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for super admin functionality.
    |
    */

    'super_admin' => [
        'enabled' => true,
        'role_name' => 'super_admin',
        'guard' => 'web',

        'impersonation' => [
            'enabled' => true,
            'session_key' => 'impersonated_by',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Configuration
    |--------------------------------------------------------------------------
    |
    | Database connection settings for central and tenant databases.
    |
    */

    'database' => [
        'central' => [
            'connection' => env('DB_CONNECTION', 'mysql'),
        ],

        'tenant' => [
            'connection' => 'tenant',
            'host' => env('TENANT_DB_HOST', env('DB_HOST', '127.0.0.1')),
            'port' => env('TENANT_DB_PORT', env('DB_PORT', '3306')),
            'username' => env('TENANT_DB_USERNAME', env('DB_USERNAME', 'forge')),
            'password' => env('TENANT_DB_PASSWORD', env('DB_PASSWORD', '')),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Caching settings for improved performance.
    |
    */

    'cache' => [
        'enabled' => true,
        'store' => env('TENANT_ENGINE_CACHE_STORE', 'redis'),
        'ttl' => env('TENANT_ENGINE_CACHE_TTL', 3600),
        'prefix' => 'tenant_engine',
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Logging
    |--------------------------------------------------------------------------
    |
    | Enable audit logging to track all actions in the system.
    |
    */

    'audit' => [
        'enabled' => env('TENANT_ENGINE_AUDIT_ENABLED', true),
        'log_super_admin' => true,
        'log_tenant_admin' => true,
        'log_tenant_user' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Swagger/OpenAPI Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for API documentation generation.
    |
    */

    'swagger' => [
        'enabled' => true,
        'route' => 'api/documentation',
        'title' => 'AlamiaCore API Documentation',
        'description' => 'Multi-Tenant SaaS API',
        'version' => '1.0.0',
        'contact' => [
            'name' => 'API Support',
            'email' => 'api@example.com',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | Security-related settings.
    |
    */

    'security' => [
        'password_min_length' => 8,
        'password_require_uppercase' => true,
        'password_require_lowercase' => true,
        'password_require_numbers' => true,
        'password_require_symbols' => false,

        'session_lifetime' => 120, // minutes
        'token_lifetime' => 60, // days

        'two_factor' => [
            'enabled' => false,
            'required_for_super_admin' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Verification
    |--------------------------------------------------------------------------
    |
    | Email verification settings.
    |
    */

    'email_verification' => [
        'enabled' => true,
        'required' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    |
    | Middleware aliases for the package.
    |
    */

    'middleware' => [
        'super_admin' => Alamia\Core\Middleware\EnsureSuperAdmin::class,
        'tenant_admin' => Alamia\Core\Authorization\Http\Middleware\TenantAdminOnly::class,
        'identify_tenant' => Stancl\Tenancy\Middleware\InitializeTenancyByPath::class,
        'check_tenant_status' => Alamia\Core\Tenant\Http\Middleware\CheckTenantStatus::class,
        'user_belongs_to_tenant' => Alamia\Core\Tenant\Http\Middleware\EnsureUserBelongsToTenant::class,
        'validate_jsonapi' => Alamia\Core\Shared\Http\Middleware\ValidateJsonApi::class,
        'log_activity' => Alamia\Core\Audit\Http\Middleware\LogActivity::class,
        'api.version' => Alamia\Core\Kernel\Http\Middleware\ApiVersionMiddleware::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Models
    |--------------------------------------------------------------------------
    |
    | Model class mappings. Override these if you extend the package models.
    |
    */

    'models' => [
        'user' => App\Models\User::class,
        'tenant' => Alamia\Core\Tenant\Models\Tenant::class,
        'super_admin' => Alamia\Core\Authorization\Models\SuperAdmin::class,
        'oauth_provider' => Alamia\Core\Identity\Models\OAuthProvider::class,
        'audit_log' => Alamia\Core\Audit\Models\AuditLog::class,
    ],

];
