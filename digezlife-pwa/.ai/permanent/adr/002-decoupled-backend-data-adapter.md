# ADR-002: Decoupled Backend Data Adapter Contract

* **Status**: Accepted
* **Date**: 2026-09-16
* **Deciders**: Engineering Team

## Context
The PWA starter kit must remain a standalone, versatile shell suitable for kickstarting any mobile-first web app—whether operating entirely offline (local mock / IndexedDB) or connecting to backends like REST APIs, GraphQL, Supabase, Firebase, or the Alamia SaaS Starter.

## Decision
Abstract all data access behind an asynchronous `DataAdapter` contract:
* `list(filters)`
* `get(id)`
* `create(payload)`
* `update(id, payload)`
* `delete(id)`
* `search(query)`

Screen components and event handlers interact only with this standard contract and never construct raw `fetch` URLs or database queries directly within template strings.

## Consequences
* **Pros**: Complete backend agnosticism. Developers can use this starter standalone out of the box or wire it to any backend simply by swapping the adapter implementation.
* **Cons**: Requires keeping UI models aligned with whichever backend schema is selected.
