# Gharly PWA — Unified Data Fetch, Cache & Synchronization Refactor

## Problem

The PWA currently appears to fetch/maintain data independently across:

1. Home
2. Sauda / Grocery
3. Hisaab
4. Alerts / Reminders

This is causing stale/inconsistent UI state.

Example:

```text
Income:   PKR 150,000
Expenses: PKR 30,000
Balance:  PKR 120,000
```

After adding:

```text
Expense: PKR 125,000
```

the correct state becomes:

```text
Balance: -PKR 5,000
```

However, after deleting that transaction, different screens can continue showing inconsistent values because some components are using stale cached/local/API data.

The current architecture must be reviewed and streamlined.

---

# Desired Architecture

The PWA should NOT independently poll/fetch the same household data from every screen.

Implement a **centralized Household Data Store / Query Cache**.

Conceptually:

```text
                    Backend API
                        │
                        ▼
              Household Snapshot
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        Local Persistent       In-Memory
             Cache                Store
              │                   │
              └─────────┬─────────┘
                        ▼
             Home / Sauda / Hisaab / Alerts
```

All screens should consume the same synchronized state.

---

# 1. Household Snapshot

Create a centralized API response representing the current household state needed by the PWA.

For example:

```text
GET /api/v1/household/snapshot
```

The snapshot may contain:

```json
{
  "household": {},
  "summary": {
    "income": 0,
    "expenses": 0,
    "balance": 0
  },
  "grocery": {},
  "transactions": {},
  "reminders": {},
  "activity": {},
  "budgets": {},
  "savings": {}
}
```

Do NOT blindly return the entire database.

Return the data required by the current application/dashboard.

Keep the API modular internally so individual domains remain maintainable.

---

# 2. Single Source of Truth

The frontend must have ONE authoritative client-side state for the active household.

Example conceptual API:

```text
householdStore.snapshot
householdStore.summary
householdStore.transactions
householdStore.grocery
householdStore.reminders
```

Screens must not independently maintain competing copies of:

* balance
* income
* expenses
* transactions
* grocery counts
* reminders
* household activity

If a screen needs data, it reads from the centralized store/cache.

---

# 3. Initial Load

When the application starts:

```text
1. Load persisted local snapshot immediately.
2. Render UI from local cache.
3. Request fresh server snapshot.
4. Replace/reconcile local state with server response.
5. Persist fresh snapshot.
6. Notify all subscribed screens/components.
```

This gives:

```text
Fast startup
+
Offline capability
+
Fresh server state
```

---

# 4. No Screen-Level Polling

Remove unnecessary polling from:

* Home
* Sauda
* Hisaab
* Alerts

Do not have every screen independently call:

```text
GET transactions
GET summary
GET reminders
GET grocery
...
```

on timers.

If polling currently exists, identify and remove redundant polling.

A single background synchronization mechanism may exist at the application/store level when genuinely necessary.

---

# 5. Mutation → Server Commit → Refresh

This is the most important requirement.

For any mutation affecting household state:

```text
User action
    ↓
Optimistic local update (where safe)
    ↓
API mutation
    ↓
Server commits transaction
    ↓
Server returns authoritative result/version
    ↓
Invalidate affected snapshot/query
    ↓
Fetch/reconcile fresh server state
    ↓
Update central store
    ↓
Persist cache
    ↓
All screens automatically update
```

For example:

```text
Create Expense
       ↓
POST /transactions
       ↓
Server commits
       ↓
Refresh household financial snapshot
       ↓
Home updates
Hisaab updates
Activity updates
```

Likewise:

```text
Delete Expense
       ↓
DELETE /transactions/{id}
       ↓
Server commits deletion
       ↓
Fresh server snapshot
       ↓
Home + Hisaab + Activity + relevant analytics update
```

---

# 6. Never Trust Local Calculations After Server Mutation

For financial mutations, the server is authoritative.

After:

* create transaction
* update transaction
* delete transaction
* restore transaction
* transfer
* income creation
* expense creation

the frontend must reconcile against server state.

Do not assume:

```text
old_balance - deleted_expense
```

is sufficient as the final authoritative result.

The server must recalculate/return the authoritative financial summary.

---

# 7. Derived Financial Values

Do not allow different screens to calculate these independently.

These values should come from one authoritative source:

```text
Total Income
Total Expenses
Balance
Deficit
This Month Income
This Month Expenses
This Month Balance
```

For example:

```text
balance = income - expenses
```

must have one backend/service implementation and one frontend representation.

Home and Hisaab must not implement separate versions of this calculation.

---

# 8. Cache Strategy

Use persistent local storage appropriate for the existing PWA architecture.

Recommended conceptual model:

```text
Server
   ↓
Normalized/structured snapshot
   ↓
Persistent cache
   ↓
Application store
   ↓
UI
```

Cache metadata should include:

```text
household_id
server_version / revision
fetched_at
last_synced_at
sync_status
```

Never mix snapshots belonging to different households/users.

---

# 9. Offline Behaviour

Offline mode must continue working.

When offline:

```text
Local cache
    ↓
UI remains usable
    ↓
Mutations enter sync queue
```

Each queued operation requires:

```text
operation_id
entity_id
operation_type
payload
created_at
retry_count
status
```

Operations must be idempotent.

When connectivity returns:

```text
Sync queue
    ↓
Server
    ↓
Successful commits
    ↓
Remove/mark operations complete
    ↓
Fetch authoritative snapshot
    ↓
Reconcile local cache
```

---

# 10. Connectivity / Sync States

Expose a global sync state:

```text
synced
syncing
offline
pending_changes
sync_error
```

The UI may show a subtle indicator such as:

```text
✓ Synced
↻ Syncing...
Offline
⚠ Changes pending
```

Do not block normal offline usage unnecessarily.

---

# 11. Mutation Invalidation

Create a centralized invalidation map.

Example:

```text
ExpenseCreated
    → financial summary
    → transactions
    → analytics
    → activity
    → budgets
    → reminders if applicable

ExpenseDeleted
    → financial summary
    → transactions
    → analytics
    → activity
    → budgets
    → reminders if applicable

GroceryItemUpdated
    → grocery
    → grocery target
    → activity if applicable

ReminderUpdated
    → reminders
    → alerts
    → activity if applicable
```

The mutation layer should trigger invalidation.

Screens should NOT know which other screens need refreshing.

---

# 12. Cross-Screen Reactivity

If the user performs:

```text
Hisaab → Delete Expense
```

then Home must immediately reflect the new authoritative state without requiring:

* page reload
* navigating away/back
* manual refresh
* arbitrary polling interval

Same applies in reverse.

Example:

```text
Home
  ↓
Quick Add Expense
  ↓
Server commit
  ↓
Central store refresh
  ↓
Home + Hisaab + Activity update
```

---

# 13. Background Synchronization

Use background synchronization conservatively.

Possible triggers:

```text
Application startup
Network reconnect
App resume / visibility change
After successful mutation
Manual pull-to-refresh
Periodic background sync when appropriate
```

Do NOT use aggressive per-screen polling.

Periodic sync should be a safety mechanism, not the primary consistency mechanism.

---

# 14. Pull-to-Refresh

Provide a global/manual refresh action.

It should perform:

```text
GET authoritative household snapshot
→ reconcile store
→ persist cache
→ update all screens
```

Not four separate API requests initiated by four screens.

---

# 15. API Design

Review existing endpoints before creating new ones.

Do not blindly add another API if existing endpoints can be composed efficiently.

Prefer:

```text
GET /household/snapshot
```

for dashboard/application synchronization.

Domain-specific APIs remain available for:

```text
transactions
grocery
reminders
budgets
savings
etc.
```

The snapshot is the synchronization mechanism, not a replacement for all domain APIs.

---

# 16. Server Revision / ETag

If practical, introduce a household state revision:

```text
household_revision
```

or equivalent server version.

Example:

```text
revision: 184
```

Mutation:

```text
revision 184
      ↓
expense deleted
      ↓
revision 185
```

Frontend stores:

```text
last_known_revision = 185
```

This helps detect stale clients and unnecessary downloads.

HTTP ETag / If-None-Match can also be used if compatible with the existing backend.

---

# 17. Race Conditions

Handle concurrent mutations.

Example:

```text
User creates expense
User immediately deletes expense
Network responses arrive out of order
```

The final UI must reflect server state, not whichever response arrived last.

Use:

* request IDs
* mutation IDs
* server revisions
* idempotency keys
* authoritative post-mutation reconciliation

where appropriate.

---

# 18. Financial Consistency Test

Add an integration test for the exact class of bug currently observed:

```text
Initial:
Income = 150,000
Expenses = 30,000
Balance = 120,000

Create expense:
125,000

Expected:
Expenses = 155,000
Balance = -5,000

Delete 125,000 expense.

Expected:
Expenses = 30,000
Balance = 120,000
```

Then verify that ALL of these show the same state:

```text
Home
Hisaab
Charts
Recent Transactions
Activity
Any affected budget/analytics
```

Also test:

```text
create → delete → create
create → update → delete
multiple rapid transactions
offline create → reconnect
offline delete → reconnect
two browser tabs
refresh during mutation
```

---

# 19. Agent Instructions

Before modifying code:

1. Inspect the current API calls.
2. Map every Home/Sauda/Hisaab/Alerts data request.
3. Identify duplicate requests.
4. Identify independent frontend state stores.
5. Identify polling/timers.
6. Identify derived financial calculations.
7. Identify cache/local-storage/IndexedDB implementation.
8. Identify mutation handlers.
9. Identify existing offline sync mechanism.
10. Reuse existing architecture wherever possible.

Then propose the smallest architectural refactor that establishes:

```text
ONE household state
ONE synchronization layer
ONE financial source of truth
ONE mutation → invalidation → reconciliation flow
```

Do not rewrite the entire PWA unnecessarily.

Preserve existing UI and functionality unless required for consistency.

---

# Definition of Done

The refactor is complete when:

* Home, Sauda, Hisaab and Alerts consume centralized state.
* Duplicate screen-level fetching is removed.
* Redundant polling is removed.
* Local cache remains functional.
* Offline mode remains functional.
* Mutations synchronize with backend.
* Successful mutations trigger authoritative reconciliation.
* Delete/update operations correctly update every affected screen.
* Financial summaries come from one authoritative calculation.
* Cross-screen state updates without page reload.
* Reconnect synchronization works.
* Concurrent/race conditions are handled.
* Multi-tab behaviour is considered.
* Existing APIs are reused where appropriate.
* Automated tests cover create/update/delete and offline scenarios.
* No stale financial figures remain after successful server mutations.

## Core principle

**Fetch broadly once, cache locally, mutate through the API, then reconcile against the server.**

Do not make every screen independently ask the backend:

> "What is the current state?"

The application should know the current household state through one synchronized data layer.
