# AI Workspace Instructions (AGENTS.md)

This file contains the foundational behavior and architectural rules for all AI agents working in `alamia-pwa-starter-kit`.

## 1. Project Context
`alamia-pwa-starter-kit` is a **standalone, backend-agnostic mobile-first PWA starter kit**. It is designed to kickstart standalone PWA applications or connect to any backend (with or without Alamia SaaS Platform as the backend).

## 2. The AI Bootstrap Sequence
If entering a fresh session without full project context, **DO NOT** guess or reverse-engineer files ad-hoc. Strictly follow this read order:
1. `.ai/README.md` (Master Index)
2. `.ai/transient/sprint/00-current-state.md`
3. `.ai/permanent/architecture/01-system-architecture.md`
4. `.ai/indexes/repository.md`
5. `.ai/permanent/standards/01-coding-standards.md`

## 3. Core Architectural Invariants
1. **Mobile-First & PWA First**: Every component must work seamlessly in mobile viewports, respect iOS notch/safe-areas (`env(safe-area-inset-*)`), and function offline via Service Worker (`public/sw.js`).
2. **Decoupled Backend Adapters**: UI screens must never make hardcoded direct API calls inside template strings. Business data must go through async adapter methods (`list()`, `get()`, `create()`, `update()`, `search()`) allowing drop-in connection to any backend API (such as Alamia SaaS Starter, Laravel, Node.js, Supabase, Firebase) or standalone local storage engines (IndexedDB, LocalStorage).
3. **No Heavy Framework Overhead**: The core shell utilizes vanilla ES modules, Vite, and Web Awesome custom elements (`@awesome.me/webawesome`). Do not introduce bulky runtime dependencies unless explicitly requested.
4. **Theme & Token Discipline**: All colors, radiuses, and shadows must use CSS variables from `src/styles.css` (`--bg`, `--card`, `--accent`, `--border`, etc.). Support dark and light modes natively.
5. **Clean Branding**: No third-party AI generator branding or vendor-specific telemetry.

## 4. Documentation Maintenance
- Update `.ai/transient/sprint/00-current-state.md` when completing significant feature increments.
- Record any architectural deviations or major design choices in `.ai/permanent/adr/`.
