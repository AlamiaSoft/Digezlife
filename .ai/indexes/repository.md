# Repository Concept Index

| Concept / Domain | Files / Locations | Notes |
| :--- | :--- | :--- |
| **Household Controller** | `digezlife-backend/app/Http/Controllers/HouseholdController.php` | Members, invites, join, cancel, remove endpoints |
| **Invitation & Membership Models** | `digezlife-backend/app/Models/TenantInvitation.php`, `TenantMembership.php` | Eloquent models for invitations and team membership |
| **PWA Auth & Join Screens** | `digezlife-pwa/src/screens/auth-signup.js`, `auth-login.js`, `join.js` | Auto-join handling, invite query param parsing |
| **Household Members UI** | `digezlife-pwa/src/screens/household.js` | Member lists, capacity meter, WhatsApp share drawer |
| **API Client Service** | `digezlife-pwa/src/services/api.js` | Sanctum tokens, household header propagation |
| **Global State Stores** | `digezlife-pwa/src/state/store.js` | `authStore`, `login()`, `logout()` |
| **Legal Documentation** | `docs/legal/legal-docs-and-relevant-features.md` | Privacy, terms, acceptable use, subscriptions specs |
| **QA Test Suite** | `docs/qa/critical-test-cases-invitations.md` | Multi-token lifecycle test cases |
| **Future Improvements** | `docs/planning/future-improvements.md` | Financial reports, budget planning, SSOT branding |
