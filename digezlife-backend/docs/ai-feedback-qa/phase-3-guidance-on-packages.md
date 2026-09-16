# Alamia Platform Development Rules

Before implementing any new infrastructure feature, always check whether Laravel or a mature Laravel ecosystem package already provides the capability.

Guiding principles:

1. Prefer Laravel first.
2. Prefer official Laravel packages second.
3. Prefer mature, actively maintained community packages (especially Spatie) third.
4. Build custom implementations only when:
   - the platform requires multi-tenant behavior unavailable elsewhere,
   - enterprise requirements are not met,
   - or the capability is a core differentiator of Alamia.

Never reimplement infrastructure that is already solved well.

Examples:

- Settings → Spatie Laravel Settings
- Feature Flags → Laravel Pennant
- Activity Logs → Spatie Activitylog
- Media → Spatie Media Library
- Backup → Spatie Laravel Backup
- Health Checks → Spatie Health
- Search → Laravel Scout
- Queues → Horizon
- Realtime → Reverb
- Monitoring → Pulse
- API Authentication → Sanctum

Alamia's responsibility is to integrate these packages into a unified multi-tenant Business Platform Kernel with consistent contracts, abstractions, permissions, billing, workflows, and tenant isolation.

---

Development workflow:

- Before writing code, inspect existing Laravel capabilities and installed packages.
- Prefer extending existing abstractions instead of replacing them.
- Keep all third-party packages behind Alamia contracts where appropriate so implementations can be swapped later.
- Never couple business modules directly to third-party packages; depend on Alamia's abstractions.

---

MCP Usage:
Must use Laravel MCP Server; if not added/installed already do install it now: https://github.com/laravel/boost
When available, always use the Laravel MCP server as the primary source of framework information before scanning source files.

Prefer MCP for:
- Artisan commands
- Routes
- Configuration
- Models
- Migrations
- Service providers
- Events
- Container bindings
- Package discovery

Use MCP to minimize unnecessary repository scanning and reduce LLM token consumption. Read source files only when implementation details are actually required.

The objective is to maximize reuse of Laravel conventions, minimize custom infrastructure, reduce maintenance cost, and keep Alamia focused on delivering reusable enterprise SaaS capabilities.