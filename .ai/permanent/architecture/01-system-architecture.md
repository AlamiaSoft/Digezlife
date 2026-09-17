# System Architecture — DigEzLife (GharlyApp)

## 1. Architectural Overview
DigEzLife / GharlyApp is a multi-tenant Progressive Web Application (PWA) powered by a Laravel 11 multi-tenant backend API.

```
                   +----------------------------------+
                   |          Cloudflare CDN          |
                   +-----------------+----------------+
                                     |
                +--------------------+--------------------+
                |                                         |
     [ PWA Frontend Client ]                    [ Laravel 11 Backend ]
    - Vanilla JS + Web Awesome                 - Sanctum Bearer Auth
    - Reactive Stores (authStore, etc.)        - Tenant Scoped Isolation
    - Service Worker Offline PWA               - Eloquent DB Models
```

## 2. Tenancy Invariants
1. **Multi-User Shared Households:** Every user has their own personal credentials. They belong to a shared `Tenant` via `tenant_user` (`TenantMembership`).
2. **Attribution:** All grocery, hisab, and reminder entries track `created_by` / `completed_by` to prevent household disputes.
3. **Invitation Expiry & Invalidation:** Invitations have a 7-day TTL. Re-generating an invite for the same recipient invalidates prior pending tokens.
