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
    - Reactive Stores (authStore, householdStore)- Tenant Scoped Isolation
    - HouseholdSync Background Engine          - HouseholdSnapshotService
    - Service Worker Offline PWA               - Eloquent DB & Modules
```

## 2. Core Architectural Subsystems

### A. Authoritative Household Snapshot Engine
- **Single Source of Backend Truth:** `HouseholdSnapshotService` produces a single consolidated operational payload via `GET /api/v1/household/snapshot`.
- **Authoritative Financial Calculations:** Income, expenses, net balance, financial health status (`'zero'`, `'surplus'`, `'deficit'`), and burn pace are calculated authoritatively on the backend using integer minor units.
- **Revision Fingerprinting & HTTP 304 Caching:** An ETag hash is derived from tenant ID, current month, record counts, latest primary keys, and transaction sums. If the client passes an `If-None-Match` header matching the current fingerprint, the server immediately returns `304 Not Modified` with zero database serialization overhead.

### B. Client Store & Synchronization Engine
- **Reactive Store (`householdStore`):** Holds the in-memory state and notifies subscribed UI components upon updates. Hydrates synchronously from `localStorage` (`digez_snapshot_${tenantId}`) on boot to deliver **0ms perceived startup latency**.
- **Sync Engine (`householdSync`):** Executes background polling, coordinates reconnect re-syncing when network drops, and handles optimistic mutations via `householdSync.mutate(mutationFn, optimisticUpdate)`.

## 3. Tenancy & PWA Invariants
1. **Multi-User Shared Households:** Every user has personal credentials and belongs to a shared `Tenant` via `tenant_user` (`TenantMembership`).
2. **Attribution:** All grocery, hisab, and reminder entries track `created_by` / `completed_by` to prevent household disputes.
3. **Server-Authoritative Financial Truth:** Client code must never perform ad-hoc arithmetic as the authoritative ledger balance; all balance and pacing metrics derive from `householdStore.summary`.
4. **Optimistic UI with Reconciliation:** User mutations apply immediately to client state, send asynchronous requests, and immediately refresh the snapshot revision from the server.
5. **Web Awesome 3.x UI Standards:** Use Lit properties directly (`drawer.open = true/false`) and avoid modal `.show()/.hide()` or conflicting data attributes. Button sizes use `size="l"` / `size="m"`.
6. **Form Submission & Value Extraction:** All forms must declare `onsubmit="event.preventDefault(); return false;"`. Read inputs using resilient helper `getInputValue(id)` supporting host `.value`, shadow DOM inputs, and attributes.
