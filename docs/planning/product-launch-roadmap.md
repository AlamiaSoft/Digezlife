# GharlyApp — Product Launch Roadmap & Feature Matrix

> **Core Value Proposition:**
> *"Ghar ka paisa, sauda aur bills — sab aik jagah."*
>
> A household should be able to install GharlyApp and, within 5 minutes, start tracking their money, grocery, and bills without any training or friction.

---

## 1. Pre-Launch Must-Complete Checklist

These items define the Minimum Lovable Product (MLP) for launch. Everything marked 🔴 **P0** or 🟠 **P1** must be functional, verified, and stable before public release.

### 🔴 Priority 0: Critical Core & Launch Blockers

| Area | Requirement | Current Status | Notes / Implementation |
| :--- | :--- | :---: | :--- |
| **Financial Correctness** | Server-authoritative calculations; integer minor units; consistent income, expense, and net balance across all views. | ✅ Completed | `HouseholdSnapshotService` calculates monthly totals, balance, deficit/surplus, and pace. |
| **Sync Engine** | Centralized data snapshot (`GET /api/v1/household/snapshot`) with 304 ETag caching, reactive store, and optimistic mutations. | ✅ Completed | `household-store.js` + `household-sync.js` deliver 0ms local load and background reconciliation. |
| **Hisaab (Core Ledger)** | Record income & expense, edit/delete entries, categories, and payment attribution. | ✅ Completed | Fully integrated with store mutations and dynamic status badges. |
| **Hisaab (Wallets & Transfers)** | Multi-wallet tracking (Cash, Bank, Mobile Wallet) and account-to-account transfers. | ✅ Completed | 3-wallet balances overview, cumulative envelopes, account-to-account neutral transfers. |
| **Sauda (Grocery)** | List creation, quick-add, drawer editing, units & quantities, checklist check-off, and shared household sync. | ✅ Completed | Store subscription, persistent toggle, category grouping, and WhatsApp list export. |
| **Bills & Reminders** | Add bills, due dates, amounts, paid/unpaid status, recurring frequencies, and due date alerts. | ✅ Completed | Reminders module active with priority tiers and due dates; polish dedicated Bills view. |
| **Home Dashboard** | Authoritative financial cards, monthly cashflow, Sauda completion counter, upcoming bills counter, unified activity. | ✅ Completed | Directly derives from snapshot summary; zero ad-hoc arithmetic drift. |
| **Household & Family** | Multi-user tenancy, invite links/tokens, role-based access control, granular capability matrix, member audit logs. | ✅ Completed | `HouseholdPermission` matrix, auto-accept join flow, and activity tracking implemented. |
| **Privacy & Visibility** | Role-based visibility rules (e.g. restrict viewer from financial totals; hide private transactions). | ✅ Completed | Capability flags (`view_hisaab`, `view_financial_totals`, `create_expense`) enforced. |
| **Offline / PWA** | Installable PWA, offline read/write for core workflows, service worker caching, 0ms boot from local cache. | ✅ Completed | Service worker configured, local cache hydration active, install banner integrated. |
| **Authentication & Auth** | Sanctum bearer tokens, session persistence, invite query auto-join, and secure logout. | ✅ Completed | Robust auth state in `store.js` and `api.js`. |
| **Security & Isolation** | Strict multi-tenant isolation (`BelongsToTenant` scope), capability middleware, no cross-household leakage. | ✅ Completed | Enforced at Eloquent and controller layers; verified via Pest architecture tests. |
| **Mobile UX & Ergonomics** | Mobile-first layout, touch targets >= 44px, zero emoji policy (using icon helper), Web Awesome 3.x tokens. | ✅ Completed | Verified on desktop and mobile viewports; deprecation warnings eliminated. |
| **Error & Conflict Handling** | Double-submission locks, resilient input extraction (`getInputValue`), offline queueing, API retry backoff. | ✅ Completed | Form submission guards, async mutation error rollbacks in place. |
| **Activity Feed** | Unified chronological household audit log with persistent dismissals and user attribution. | ✅ Completed | Derived from snapshot activity; dismissal IDs saved in localStorage. |

---

### 🟠 Priority 1: Launch Quality & Operational Readiness

| Area | Requirement | Current Status | Notes / Implementation |
| :--- | :--- | :---: | :--- |
| **Reports & Breakdown** | Monthly/weekly income vs expense breakdown, category charts, and spend velocity. | ✅ Completed | Dedicated `#/reports` screen, timeframe filters, member attribution, and monthly trend. |
| **Household Budget** | Set monthly household spending limit with warning threshold indicators (80%, 100%). | ✅ Completed | Dynamic budget progress bar with color-coded safety thresholds (Safe, Caution, Exceeded). |
| **Savings Goals** | Create named savings targets (e.g. Emergency, Eid, Travel) with target amounts and deposit logs. | 📋 Planned | Basic savings bucket model and dashboard widget. |
| **Localization & Formatting** | Pakistan Rupee formatting (`Rs.` / `PKR`, commas, minor units), Urdu / Roman Urdu locale strings. | ✅ Completed | `t()` i18n helper with brand interpolation and currency formatting active. |
| **5-Minute Onboarding** | First-run setup: Welcome → Name Household → Add First Expense → Add First Sauda Item → Add First Bill. | ✅ Completed | Quickstart checklist on Home screen with real-time progress, guided setup wizard, and pending name handoff. |
| **Subscription Gating** | Clean separation of Free vs Premium features (`#/paywall`), subscription status checks. | ✅ Completed | `paywall.js` screen and subscription check hooks created. |
| **Manual Billing / Activation** | Simple mechanism to activate Premium (promo code, proof-of-payment via WhatsApp) before payment gateway. | ✅ Completed | Voucher redemption (`LAUNCH2026`, `EARLYBIRD`, `GHARLYVIP`), local bank/wallet instructions drawer, 1-tap WhatsApp receipt verification. |
| **Legal Suite** | Terms of Service, Privacy Policy, Acceptable Use, Subscriptions, and Security policy with signup consent. | ✅ Completed | 5 comprehensive legal screens and backend `legal_acceptances` logging live. |
| **Data Export / Backup** | Household data download (CSV / JSON) for Hisaab ledger and Sauda archives. | ✅ Completed | 1-tap CSV export on Reports, Hisab, and Grocery screens with UTF-8 BOM. |
| **Support & Feedback** | In-app feedback modal or direct WhatsApp link to customer support. | ✅ Completed | Direct WhatsApp support link and support email (`support@gharlyapp.com`) configured. |
| **Production Deployment** | Automated Docker/Portainer deployment on VPS, Cloudflare SSL, scheduled DB backups, log rotation. | ⏳ Ready for Deploy | Production branch configured and verified; pending VPS deployment execution. |

---

## 2. Post-Launch Features & Enhancement Backlog

The following features are **explicitly non-blocking for initial launch**. They represent growth drivers and competitive differentiators to be rolled out across post-launch release phases.

```
                    [ INITIAL LAUNCH ]
           Ghar ka paisa, sauda aur bills — sab aik jagah
                                |
        +-----------------------+-----------------------+
        |                                               |
  [ Phase 2: Fast-Follows ]                    [ Phase 3: Intelligence & Scale ]
  - Automated PakPay Gateways                  - Local Market Price Index
  - WhatsApp / Ghar ka Bot                     - Committee / Kameti Tracker
  - Smart Budget Recommendations               - Urdu AI Financial Assistant
  - PDF Statement Sharing                      - Bank SMS / Notification Parsing
```

### 🚀 Phase 2: Immediate Fast-Follows (V1.1 – V1.2)

1. **Automated Local Payment Gateways (PakPay)**
   - 1-click JazzCash, Easypaisa, and Raast instant checkout for Premium subscriptions.
   - Webhook automation to instantly upgrade tenant subscription tier and credit Giveback pool.

2. **WhatsApp / Ghar ka Bot Integration**
   - Ingest expenses, incomes, or grocery items via incoming WhatsApp text or audio note.
   - Natural language parser: *"Kal 1500 ki doodh aur dahi li"* &rarr; logs PKR 1,500 Grocery expense.
   - Daily morning household briefing sent to family WhatsApp group (pending bills + sauda list).

3. **Smart Budget Recommendations & Analytics**
   - Rolling 3-month spending pattern analysis.
   - Dynamic budget suggestions: *"Aap har maheenay kitchen par PKR 45,000 kharch kartay hain. Aglay maheenay ka budget set karein?"*
   - Interactive category comparison charts with month-over-month variance.

4. **PDF Statement & Export Sharing**
   - Branded monthly financial statement PDF generator.
   - 1-tap WhatsApp sharing for family transparency and landlord/tenant rent receipts.

---

### 📈 Phase 3: Market Intelligence & Community Features (V1.3 – V2.0)

1. **Local Market Sauda Price Index**
   - Crowdsourced and scraped local grocery prices across major Pakistani cities (Karachi, Lahore, Islamabad/Rawalpindi).
   - Price comparison between local bazaar, utility stores, and supermarkets (Imtiaz, Carrefour, Metro).
   - Alert users when staple commodities (atta, ghee, sugar, petrol) fluctuate significantly.

2. **Committee / Bisiya / Kameti Tracker**
   - Traditional Pakistani rotating savings club management.
   - Track pool amount, monthly contribution per member, payout turn schedule, and payment status.
   - Send automatic reminder notifications to committee members before monthly due dates.

3. **Urdu / Roman Urdu AI Household Financial Assistant**
   - Conversational AI powered by small language models for low-latency queries.
   - Natural language queries: *"Is maheenay bijli ka bill kitna aya tha?"* or *"Hisaab mein kitnay paisay bachay hain?"*
   - Expense categorization assistant suggesting tags for uncategorized entries.

4. **Bank SMS & Notification Parser (Android PWA / Native Wrapper)**
   - Automatically extract transaction amount, merchant name, and date from Pakistani banking SMS (Meezan, HBL, Bank Alfalah, Faysal, Standard Chartered).
   - Prompt user with 1-tap approval notification: *"PKR 3,200 spent at Shell. Record as Fuel expense?"*

5. **Giveback & Community Rewards Pool Activation**
   - Pluggable `modules/giveback` activated for live end-user cashback and referral incentives.
   - 2.5% of subscription revenue pooled into community giveback pool with transparent live counter.
   - Tiered referral incentives: Invite 3 neighboring households, receive 1 month free Premium.

6. **Voice Expense Entry**
   - In-app microphone button for hands-free expense entry in Urdu, Roman Urdu, or English.
   - Ideal for recording purchases immediately upon exiting a store while carrying grocery bags.

7. **Multi-Currency & Overseas Diaspora Remittance Mode**
   - Tailored for overseas Pakistanis (UAE, Saudi Arabia, UK, USA, Canada) funding households back home.
   - Multi-currency input (AED, SAR, GBP, USD) with real-time conversion to PKR.
   - Separate view for remittance sender to verify bill payments and household maintenance expenditures.

---

## 3. Launch Readiness Evaluation

Before announcing to public beta testers, verify this single operational invariant:

> **"Can a household install GharlyApp and, within 5 minutes, record an expense, add a grocery item, and see their live balance without requiring developer assistance?"**

When all 🔴 **P0** and 🟠 **P1** items are signed off, proceed directly to initial deployment rather than delaying for post-launch enhancements.
