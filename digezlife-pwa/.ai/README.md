# AI Knowledge Base Master Index

Welcome to the canonical AI knowledge base for **Alamia PWA Starter Kit** (`alamia-pwa-starter-kit`).

This repository is a standalone, mobile-first, domain-neutral Progressive Web App (PWA) shell built with vanilla JavaScript, modern CSS design tokens, Vite, and Web Awesome primitives. It is designed to kickstart standalone PWA applications or connect to any backend infrastructure (with or without Alamia SaaS Starter as the backend).

## The AI Bootstrap Read Order
When entering a fresh conversation, AI agents **must** read the following documents in order before writing or modifying code:

1. `00-project-overview.md` (You are here: `.ai/README.md`)
2. `permanent/architecture/01-system-architecture.md`
3. `indexes/repository.md`
4. `permanent/standards/01-coding-standards.md`
5. `transient/sprint/00-current-state.md`

---

## Directory Structure

### 📁 Permanent Knowledge (Lives for Years)
* **`permanent/architecture/01-system-architecture.md`**: System boundaries, PWA lifecycle, app-shell layout, state machine, service worker strategy, and pluggable backend adapters.
* **`permanent/adr/`**: Architecture Decision Records (e.g. ADR-001: Mobile-first Vanilla PWA with Web Awesome & Vite, ADR-002: Decoupled Backend Data Adapter).
* **`permanent/glossary/glossary.md`**: Project terminology and domain concepts.
* **`permanent/standards/01-coding-standards.md`**: CSS tokens, HTML markup rules, state mutation discipline, and accessibility.

### 📁 Transient Knowledge (Lives for Sprints/Days)
* **`transient/sprint/00-current-state.md`**: Current production state, screen readiness, and immediate milestones for standalone PWA foundation.
* **`transient/backlog/backlog.md`**: Prioritized roadmap (pluggable adapters, offline queue, push notifications).
* **`transient/handoffs/`**: Session-to-session handoff logs.
* **`transient/repository-health.md`**: Architectural integrity and test status.

### 📁 History, Indexes & Lessons
* **`indexes/repository.md`**: Map of source directories and files to conceptual layers.
* **`indexes/dependency-map.md`**: Visual Mermaid diagrams of runtime and pluggable data integration.
* **`lessons/lessons-learned.md`**: PWA pitfalls, iOS safe-area handling, and offline cache strategies.
