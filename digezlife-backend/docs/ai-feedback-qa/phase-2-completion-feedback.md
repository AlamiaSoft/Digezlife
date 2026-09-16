Good catch. Both suggestions are internally consistent—they just apply at **different layers**. After thinking through the long-term implications, I'd revise my earlier recommendation.

I **would not** make `Alamia` a broad service facade.

The problem is that this:

```php
Alamia::tenant()
Alamia::billing()
Alamia::workflow()
Alamia::ai()
```

gradually becomes a **God Facade** and, effectively, a service locator. Over time it accumulates dozens of methods:

```php
Alamia::tenant()
Alamia::billing()
Alamia::workflow()
Alamia::notifications()
Alamia::settings()
Alamia::featureFlags()
Alamia::api()
Alamia::search()
Alamia::media()
...
```

That makes dependencies less explicit and testing more cumbersome.

## What I'd recommend instead

Keep `Alamia` very small.

```php
Alamia::version();
Alamia::edition();
Alamia::modules();
Alamia::isEnterprise();
Alamia::environment();
```

That's metadata about the platform itself.

Then each domain exposes its own service through dependency injection:

```php
public function __construct(
    TenantManager $tenants,
    BillingManager $billing,
    WorkflowManager $workflow,
) {}
```

or

```php
app(TenantManager::class);
app(BillingManager::class);
```

This keeps dependencies explicit.

## If you still want facades

Laravel already embraces facades, so if you want the convenience, I'd make them **domain-specific**, not centralized.

```text
Tenant::current();
Tenant::switch();

Billing::currentPlan();
Billing::subscribe();

Workflow::dispatch();

Settings::get();

Features::enabled();

Notifications::send();
```

That's much cleaner than routing everything through `Alamia`.

## My final recommendation

I'd structure it like this:

```text
Alamia
│
├── version()
├── edition()
├── modules()
├── booted()
└── environment()

Tenant facade
Billing facade
Workflow facade
Settings facade
FeatureFlags facade
Notifications facade
```

This follows Laravel's philosophy and keeps the kernel from becoming a catch-all entry point.

So, I would **change my earlier recommendation**: keep `Alamia` as a lightweight platform API, and let each domain own its own facade (or better yet, rely on dependency injection internally). That approach will scale much better as Alamia grows.
