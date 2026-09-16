# ADR-001: Mobile-First Vanilla PWA Shell with Web Awesome Primitives

* **Status**: Accepted
* **Date**: 2026-09-16
* **Deciders**: Engineering & Product Team

## Context
When building personal consumer utilities and SaaS frontends targeting mobile-heavy markets (e.g. Pakistan, emerging markets), native app store friction, app size, and framework payload overhead are critical barriers to acquisition and retention.

## Decision
1. Build the frontend shell as a **Progressive Web App (PWA)** using standard ES modules and Vite.
2. Use **Web Awesome** (`@awesome.me/webawesome`) for accessible UI component primitives.
3. Handle app routing and screen composition using a clean, functional state-driven pattern (`src/main.js`).
4. Maintain full offline readiness via Service Worker caching (`public/sw.js`).

## Consequences
* **Pros**:
  * Near-zero runtime bloat (<50KB compressed shell).
  * Instant load times on slow 3G/4G connections.
  * Native-like home-screen installability without app store approval friction.
  * Direct portability to any backend (Laravel, Node, Go, Supabase).
* **Cons**:
  * Complex client-side navigation must be manually managed in state or upgraded to a lightweight router when views exceed ~20 screens.
