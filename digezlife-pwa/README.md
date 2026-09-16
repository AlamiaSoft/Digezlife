# Alamia PWA Starter

A domain-neutral, mobile-first PWA shell built with HTML, CSS, vanilla JavaScript, Vite, and [Web Awesome](https://webawesome.com/). Web Awesome provides accessible, maintained primitives while this project focuses on product composition: app bars, bottom navigation, cards, state screens, forms, and offline behavior.

## Run locally

```bash
pnpm install
pnpm dev
```

Build with `pnpm build` and preview with `pnpm start`.

## Architecture

- `src/main.js` — state-driven demo application and screen compositions
- `src/styles.css` — semantic theme tokens, responsive layout, safe-area handling, dark mode, and reduced motion
- `public/manifest.webmanifest` — install metadata
- `public/sw.js` — app-shell cache and offline fallback

The demo uses a small in-memory service shape (`records`) so the UI can be replaced with Laravel, Alamia, or another backend without changing the screen composition. Replace the local array and action handlers with async adapter methods such as `list()`, `get(id)`, `create(payload)`, `update(id, payload)`, and `search(query)`.

## Demo flow

Use bottom navigation to explore Home, Activity, Search, Updates, and Profile. Profile includes Settings, theme switching, and test controls for offline, empty, and unavailable states. Create/edit, detail, subscription, confirmation, onboarding, and auth flows are reachable from the app shell.

## PWA notes

The app registers a versioned service worker, caches the shell, handles online/offline changes, exposes install metadata, and captures the browser install prompt when supported. For a production deployment, replace the placeholder icon with branded PNG sizes and add a real update prompt around `registration.waiting`.

## Persistence

Theme preference is stored through `localStorage` under `alamia-theme`. In a real product, move user records and session data to your API; local storage should remain limited to non-sensitive UI preferences and offline drafts.

