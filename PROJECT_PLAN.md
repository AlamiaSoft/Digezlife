# DigEzLife Project Plan and Roadmap

This is the primary project tracking document for DigEzLife.

The full phase-wise execution plan with architecture diagrams and DAG task breakdown is available at:
[docs/planning/DigEzLife-Phase-Wise-Execution-Plan.md](docs/planning/DigEzLife-Phase-Wise-Execution-Plan.md)

---

## High-Level Phases and Status

| Phase | Focus Area | Status | Target Deliverables |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Foundation and Household Tenancy** | Completed | Household scoping (tenant_id), Sanctum token auth, PWA API adapter, invite tokens |
| **Phase 2** | **Module 1: Grocery and Shopping List** | Completed | modules/grocery, list CRUD, fast checklist UI, WhatsApp export and share |
| **Phase 3** | **Module 2: Personal Hisab and Udhaar** | Completed | modules/hisab, numerical keypad, cashflow analytics, debt/repayment tracker |
| **Phase 4** | **Module 3: Reminders and Recurring Tasks** | Completed | modules/reminders, cron scheduler, document/bill alerts |
| **Phase 5** | **Security Perimeter & Hardening Layer** | Completed | CORS, Security headers, Rate limiting, IDOR tenant isolation, VPS Portainer setup |
| **Phase 6** | **Monetization and PakPay Billing** | Up Next | JazzCash/Easypaisa/Safepay drivers, Pennant tier gating (Free vs Plus vs Family) |
| **Phase 7** | **Referral Growth & Viral Loops** | Scheduled | Referral code generator, family invite links, rewards tracking |
| **Phase 8** | **Multilingual Localization & Custom Categories** | Scheduled | Urdu (Nastaliq & Roman) + English localization, custom category management |
| **Phase 9** | **Offline Sync Queue, Hardening and Launch** | Scheduled | IndexedDB mutation queue, automated tests, Docker VPS launch |

---

## Documentation Index

- **Deployment Runbook**: [docs/deployment/hetzner-portainer-deployment-guide.md](docs/deployment/hetzner-portainer-deployment-guide.md)
- **Feasibility and Commercial Model**: [docs/initial-project-discussion/SaaS-Feasibility-Projection.md](docs/initial-project-discussion/SaaS-Feasibility-Projection.md)
- **Phase-Wise Execution Plan**: [docs/planning/DigEzLife-Phase-Wise-Execution-Plan.md](docs/planning/DigEzLife-Phase-Wise-Execution-Plan.md)
- **Future Improvements & Backlog**: [docs/planning/future-improvements.md](docs/planning/future-improvements.md)
- **Backend AI Knowledge Base**: `digezlife-backend/.ai/`
- **PWA Client AI Knowledge Base**: `digezlife-pwa/.ai/`
