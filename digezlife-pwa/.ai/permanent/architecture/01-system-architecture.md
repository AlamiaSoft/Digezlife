# System Architecture: Alamia PWA Starter

## 1. Executive Summary & Purpose
The `alamia-pwa-starter-kit` is a standalone, backend-agnostic, mobile-first Progressive Web Application shell designed for speed, low cognitive overhead, and maximum flexibility. It provides accessible UI composition, bottom-navigation layouts, offline resiliency, theme switching, and modular screen rendering. It is intended to kickstart standalone PWAs or connect to any backend infrastructure (custom REST/GraphQL APIs, Supabase, Firebase, SQLite WASM/IndexedDB, or the Alamia SaaS Starter).

---

## 2. Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / PWA Shell                   │
│  - Web App Manifest (public/manifest.webmanifest)            │
│  - Service Worker (public/sw.js - Cache-First App Shell)    │
│  - Viewport & Safe-Area Insets (iOS/Android Standalone)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Presentation & UI Composition              │
│  - Entrypoint: index.html -> src/main.js                    │
│  - Styling & Design Tokens: src/styles.css                  │
│  - UI Primitives: @awesome.me/webawesome (WA Elements)      │
│  - Screen Composers: Home, Activity, Search, Updates,       │
│    Profile, Settings, Subscription, Create, Detail, Auth    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Reactive State & Events                  │
│  - Global State Object (`state` in src/main.js)             │
│  - Action Dispatcher (`act(action)`)                        │
│  - Online/Offline Event Listeners                           │
│  - Local Persistence (`localStorage['alamia-theme']`)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             Pluggable Backend / Persistence Adapter         │
│  - Option 1: In-Memory / LocalStorage / IndexedDB (Offline) │
│  - Option 2: Generic REST / JSON:API / Node / Python        │
│  - Option 3: Alamia SaaS Platform / Laravel API             │
│  - Option 4: Backend-as-a-Service (Supabase / Firebase)     │
│    CRUD Contract: list(), get(id), create(), update()       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules & Screen Composition

| Screen | Identifier | Role & Functionality |
| :--- | :--- | :--- |
| **Home** | `'home'` | Daily progress hero ring, contextual notice/nudges, recent items, and quick-add card. |
| **Activity** | `'activity'` | Searchable and filterable record list (tags: `All`, `Personal`, `Work`, `Home`). |
| **Search** | `'search'` | Dedicated large search input with instant substring query matching. |
| **Updates** | `'notifications'` | Notification list with unread markers and empty state illustration. |
| **Profile** | `'profile'` | User header, account menu, navigation to Settings, Subscription, and Auth. |
| **Settings** | `'settings'` | Theme toggles (Light/Dark), offline switch, demo state triggers (`offline`, `empty`, `unavailable`). |
| **Subscription** | `'subscription'` | Paywall / Tier feature card for SaaS monetization. |
| **Item Detail** | `'detail'` | Detailed item view with progress bar, status tags, and action buttons. |
| **Create Item** | `'create'` | Input form with name, category context selector, and description textarea. |
| **Onboarding & Auth** | `'onboarding'`, `'auth'` | Welcome walkthrough and email sign-in forms. |

---

## 4. PWA & Offline Strategy

### Service Worker (`public/sw.js`)
- **App Shell Caching**: Automatically pre-caches `index.html`, `src/styles.css`, `src/main.js`, and Web Awesome assets upon `install`.
- **Cache Invalidation & Cleanup**: Automatically flushes stale caches upon `activate` event.
- **Cache First, Network Fallback**: Static assets are served immediately from cache for near-instant load times (<100ms).
- **Network Interception**: Catches offline scenarios and gracefully routes requests without breaking the UI shell.
- **Connectivity Awareness**: Listens to `window.online` and `window.offline` events to render the dynamic `.status-banner.offline` across all screens.

### Web App Manifest (`public/manifest.webmanifest`)
- `display`: `"standalone"`
- `theme_color`: `"#09090b"` (Zinc Dark / Monochrome)
- `background_color`: `"#ffffff"`
- `icons`: Scalable SVG (`/icons/icon.svg`) + 32x32 / 180x180 PNG variants.

---

## 5. Backend Adapter Contract
The UI interacts strictly with an asynchronous `DataAdapter` interface, allowing developers to plug in any data source:

```javascript
export const DataAdapter = {
  async list(filters = {}) { /* Fetch collection from LocalDB, REST API, or GraphQL */ },
  async get(id) { /* Fetch single item */ },
  async create(payload) { /* Persist new record */ },
  async update(id, payload) { /* Update existing record */ },
  async delete(id) { /* Remove record */ },
  async search(query) { /* Perform query search */ }
};
```
Replacing the mock `records` array with this contract connects the entire UI without modifying screen markup functions.
