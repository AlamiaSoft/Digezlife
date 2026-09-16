# DigEzLife Backend AI Knowledge Base Master Index

Welcome to the canonical AI knowledge base for the **DigEzLife SaaS Backend** (`digezlife-backend`).

DigEzLife Backend is a high-performance multi-tenant Laravel 13 engine powering the DigEzLife personal and household utility platform. It features shared single-database tenancy scoping, ARBAC permissions, NanoID security, and pluggable business modules (`modules/grocery`, `modules/hisab`, `modules/reminders`).

## The AI Bootstrap Read Order
AI agents entering a new session must read the following documents in order before modifying code:

1. `00-project-overview.md` (You are here: `.ai/README.md`)
2. `permanent/architecture/01-system-architecture.md`
3. `indexes/repository.md`
4. `permanent/standards/01-coding-standards.md`
5. `transient/sprint/00-current-state.md`

---

## Directory Structure

### Permanent Knowledge
* `permanent/architecture/01-system-architecture.md`: Multi-tenancy scoping, module autoloading, and Octane readiness.
* `permanent/standards/01-coding-standards.md`: PSR-12, NanoIDs, Pest PHP testing, strict types.
* `permanent/glossary/glossary.md`: Domain terms (Household, GroceryList, Hisab, Udhaar, Reminder).

### Transient Knowledge
* `transient/sprint/00-current-state.md`: Active sprint status and module readiness.
* `transient/backlog/backlog.md`: Pending backend tasks and features.
* `transient/repository-health.md`: Test coverage and database migration status.

### Indexes & Lessons
* `indexes/repository.md`: Map of domain modules (`modules/*`) to API routes.
* `lessons/lessons-learned.md`: Tenancy query scoping and SQLite concurrency insights.
