# Current Sprint State

## Status: Active Development / Unified Data Engine Verified
- **Unified Household Snapshot Engine:** Single authoritative payload (`GET /api/v1/household/snapshot`) managed by `HouseholdSnapshotService.php`. Computes financial summaries (`income`, `expenses`, `balance`, `status`, `pace`, `insight`), categories, recent transactions, active grocery items, active reminders, and unified activity feed with SHA1 ETag HTTP 304 caching.
- **Reactive Client Store & Sync Engine:** `householdStore.js` and `householdSync.js` provide 0ms instant startup via local storage snapshot cache, reactive pub/sub state distribution, and optimistic mutations (`householdSync.mutate()`) with server reconciliation.
- **Dynamic Financial State Indicators:** Dynamic status badges communicate exact states (`Surplus`, `Deficit`, `Balanced`, `No activity yet`) across Home and Hisab based strictly on authoritative minor units calculation.
- **CRUD & UI Polish:** Full edit/delete capabilities verified across Hisab, Grocery, and Reminders; date fields pre-populated to current day; Web Awesome 3.x button size deprecations updated to `size="l"` / `size="m"`.
- **Family Permissions & Capabilities:** Role & granular capability matrix (`HouseholdPermission`, `MemberActivityLog`, `CheckHouseholdCapability`).
- **Giveback & Rewards Domain:** Pluggable `modules/giveback` with append-only ledger entries, referral campaigns, and Giveback pool.
- **SSOT Brand System:** Brand strings and URLs decoupled into `src/config/brand.js` and `.env` (`GharlyApp` / `Gharly`).
- **Next High-Priority Focus:** Production VPS deployment, Financial Reports & Budget Recommendations (`#/reports`, `#/analytics`), and PakPay payment gateway integration.
