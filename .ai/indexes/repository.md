# Repository Concept Index

| Concept / Domain | Files / Locations | Notes |
| :--- | :--- | :--- |
| **Household Snapshot Service** | `digezlife-backend/app/Services/HouseholdSnapshotService.php` | Single-payload backend aggregation, financial calculations, ETag fingerprinting |
| **Household Controller** | `digezlife-backend/app/Http/Controllers/HouseholdController.php` | Members, invites, join, cancel, remove, and snapshot endpoints |
| **Snapshot Feature Tests** | `digezlife-backend/tests/Feature/HouseholdSnapshotTest.php` | Lifecycle test: income, expense, balance, 304 ETag verification |
| **Reactive Household Store** | `digezlife-pwa/src/state/household-store.js` | Single reactive client store, pub/sub state, local cache hydration |
| **Household Sync Engine** | `digezlife-pwa/src/services/household-sync.js` | Background polling, network listener, optimistic mutation pipeline |
| **Data Poll & Cache Strategy** | `docs/planning/features/data-poll-strategy.md` | Architectural specification for snapshot & cache synchronization |
| **Invitation & Membership Models** | `digezlife-backend/app/Models/TenantInvitation.php`, `TenantMembership.php` | Eloquent models for invitations and team membership |
| **PWA Auth & Join Screens** | `digezlife-pwa/src/screens/auth-signup.js`, `auth-login.js`, `join.js` | Auto-join handling, invite query param parsing |
| **Household Members UI** | `digezlife-pwa/src/screens/household.js` | Member lists, capacity meter, WhatsApp share drawer |
| **Grocery Module UI** | `digezlife-pwa/src/screens/grocery.js` | Quick-add, drawer, store subscription, optimistic mutate |
| **Personal Hisab Module UI** | `digezlife-pwa/src/screens/hisab.js` | Dynamic status badge, drawer, store subscription, optimistic mutate |
| **Reminders Module UI** | `digezlife-pwa/src/screens/reminders.js` | Active & completed alerts, recurrence, store subscription |
| **Home Dashboard UI** | `digezlife-pwa/src/screens/home.js` | Real-time snapshot metrics, dynamic badge, unified activity feed |
| **API Client Service** | `digezlife-pwa/src/services/api.js` | Sanctum tokens, household header propagation, snapshot fetcher |
| **Global State Stores** | `digezlife-pwa/src/state/store.js` | `authStore`, `login()`, `logout()` |
| **SSOT Brand Config** | `digezlife-pwa/src/config/brand.js` | Centralized brand properties (`GharlyApp`, `Gharly`, `G`) |
| **Giveback & Rewards Domain** | `digezlife-backend/modules/giveback/` | Reward ledger, cashback rules, referral campaigns |
| **Legal Documentation** | `docs/legal/legal-docs-and-relevant-features.md` | Privacy, terms, acceptable use, subscriptions specs |
| **QA Test Suite** | `docs/qa/critical-test-cases-invitations.md` | Multi-token lifecycle test cases |
| **Handoff Records** | `.ai/transient/handoffs/`, `docs/handoffs/` | Historical session records and progress logs |
