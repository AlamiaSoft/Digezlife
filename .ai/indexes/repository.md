# Repository Concept Index

| Concept / Domain | Files / Locations | Notes |
| :--- | :--- | :--- |
| **Household Controller** | `digezlife-backend/app/Http/Controllers/HouseholdController.php` | Members, invites, join, cancel, remove endpoints |
| **Invitation & Membership Models** | `digezlife-backend/app/Models/TenantInvitation.php`, `TenantMembership.php` | Eloquent models for invitations and team membership |
| **PWA Auth & Join Screens** | `digezlife-pwa/src/screens/auth-signup.js`, `auth-login.js`, `join.js` | Auto-join handling, invite query param parsing |
| **Household Members UI** | `digezlife-pwa/src/screens/household.js` | Member lists, capacity meter, WhatsApp share drawer |
| **Grocery Module UI** | `digezlife-pwa/src/screens/grocery.js` | List switcher, quick-add, drawer, local persistence |
| **Personal Hisab Module UI** | `digezlife-pwa/src/screens/hisab.js` | Cashflow analytics, expense/income drawer, Udhaar tracking |
| **Reminders Module UI** | `digezlife-pwa/src/screens/reminders.js` | Active & completed alerts, recurrence, local persistence |
| **Home Dashboard UI** | `digezlife-pwa/src/screens/home.js` | Real-time multi-module aggregation & activity feed |
| **API Client Service** | `digezlife-pwa/src/services/api.js` | Sanctum tokens, household header propagation |
| **Global State Stores** | `digezlife-pwa/src/state/store.js` | `authStore`, `login()`, `logout()` |
| **Legal Documentation** | `docs/legal/legal-docs-and-relevant-features.md` | Privacy, terms, acceptable use, subscriptions specs |
| **QA Test Suite** | `docs/qa/critical-test-cases-invitations.md` | Multi-token lifecycle test cases |
| **Handoff Records** | `.ai/transient/handoffs/`, `docs/handoffs/` | Historical session records and progress logs |
