# PWA Session Handoff

**Date**: 2026-09-18
**Scope**: SSOT Brand Config, Rewards Dashboard, Legal Pages Suite, FA 403 Icon Resolution, and Route Registrations

### Key Decisions & UI Notes:
1. **SSOT Centralized Brand Config**:
   - `src/config/brand.js` exports frozen `BRAND` object referencing `VITE_APP_*` environment variables.
   - Dynamic i18n interpolation auto-injects `{appName}`, `{appShortName}`, `{appDomain}`, `{appTagline}` across all translation lookups.
   - Decoupled hardcoded branding across all auth, layout, and feature screens.
2. **Icon 403 Resolution**:
   - Replaced broken FA solid CDN icon `arrow-down-left` with standard free solid `arrow-down` across all Hisab and Quick-Add income components.
3. **Rewards Screen (`#/rewards`)**:
   - Shows Cashback, Credits, Points, and Combined Available totals.
   - Giveback pool transparency percentage indicator.
   - Referral card with 1-click copy and direct WhatsApp share link.
   - Append-only activity feed with reward status tracking.
4. **Legal Documentation Suite**:
   - 5 dedicated screens: `#/privacy`, `#/terms`, `#/acceptable-use`, `#/subscriptions`, and `#/security`.
   - Settings (`#/settings` / `#/profile`) formatted with an unobstructed Legal & Policies card.
   - Public landing page (`#/landing`) and login screen (`#/login`) include direct legal footer navigation.
   - Registration screen (`#/signup`) enforces a mandatory terms agreement checkbox.
5. **Production Verification**:
   - `npx vite build` passing with 0 errors (335 modules transformed).

### Next Steps:
- Reports & Analytics dashboard (`#/reports`).
- Input and form ergonomics polish.
