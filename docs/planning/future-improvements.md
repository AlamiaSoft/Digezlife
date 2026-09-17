# Future Improvements & Backlog Tasks

This document tracks technical debt, architecture enhancements, and planned refactorings for **GharlyApp** (`gharlyapp.com`).

---

## 1. Centralized Single Source of Truth (SSOT) Brand Configuration

### Context & Goal
Currently, the brand name **GharlyApp** is referenced across several UI screens, notification templates, and i18n locale dictionaries. To allow seamless future rebranding, tenant whitelabeling, or domain adjustments from a single location, all branding identifiers should be decoupled and driven by environment variables (`.env`) and a centralized branding config module.

### Proposed Architecture

#### 1. Environment Variables (`digezlife-pwa/.env` and `.env.example`)
```env
# Branding Configuration
VITE_APP_NAME=GharlyApp
VITE_APP_SHORT_NAME=Gharly
VITE_APP_MARK=G
VITE_APP_TAGLINE=Your Home, Made Easier
VITE_APP_DOMAIN=gharlyapp.com
VITE_APP_SUPPORT_EMAIL=support@gharlyapp.com
VITE_APP_DEMO_EMAIL=demo@gharlyapp.com
VITE_APP_WHATSAPP_PREFIX=Gharly Grocery List
```

#### 2. Centralized Config Module (`digezlife-pwa/src/config/brand.js`)
```javascript
export const BRAND = Object.freeze({
  name: import.meta.env.VITE_APP_NAME || 'GharlyApp',
  shortName: import.meta.env.VITE_APP_SHORT_NAME || 'Gharly',
  mark: import.meta.env.VITE_APP_MARK || 'G',
  tagline: import.meta.env.VITE_APP_TAGLINE || 'Your Home, Made Easier',
  domain: import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com',
  supportEmail: import.meta.env.VITE_APP_SUPPORT_EMAIL || 'support@gharlyapp.com',
  demoEmail: import.meta.env.VITE_APP_DEMO_EMAIL || 'demo@gharlyapp.com',
  whatsappPrefix: import.meta.env.VITE_APP_WHATSAPP_PREFIX || 'Gharly Grocery List',
  modules: {
    grocery: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Grocery`,
    hisab: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Hisab`,
    alerts: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Alerts`,
    family: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Family`,
  },
  urls: {
    website: `https://${import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com'}`,
    invite: (token) => `https://${import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com'}/invite/${token}`,
  }
});
```

#### 3. Dynamic i18n Interpolation (`digezlife-pwa/src/i18n/index.js`)
- Update `t(key, params)` helper in `src/i18n/index.js` to automatically inject global brand placeholders `{appName}`, `{appDomain}`, `{appTagline}` into any dictionary string.
- Update locale JSON files (`src/i18n/locales/*.json`) to use `{appName}` placeholders instead of hardcoded strings:
  ```json
  "auth": {
    "loginTitle": "Welcome to {appName}",
    "signupSubtitle": "Create your {appName} account"
  }
  ```

#### 4. UI Screen Decoupling
- Refactor `app-topbar.js`, `landing.js`, `splash.js`, `grocery.js`, `hisab.js`, `share.js`, `settings.js` to import and reference `BRAND` constants instead of inline string literals.

---

## 2. Additional Future Enhancements

- [ ] **Dynamic Manifest Injection**: Dynamically inject PWA `name` and `short_name` into `manifest.webmanifest` during Vite build using `vite-plugin-pwa` or HTML transforms.
- [ ] **Favicon & SVG Monogram Generator**: Generate the "G" mark icon variations (192, 512, maskable) dynamically or via a branded build asset script.
- [ ] **Backend Mail & Notification Branding**: Ensure Laravel mail templates and SMS/WhatsApp drivers read from `config('app.name')` and `config('services.branding.*')`.

---

## 3. UI & PWA Issues Log & Resolutions

### Issue #1: `beforeinstallpromptevent.preventDefault() called` Dev Console Message
- **Observed Behavior**: `Banner not shown: beforeinstallpromptevent.preventDefault() called. The page must call beforeinstallpromptevent.prompt() to show the banner.`
- **Technical Context**: Chromium logs this informational notice in DevTools whenever a PWA calls `e.preventDefault()` on `beforeinstallprompt` to prevent the browser's default mini-infobar from abruptly blocking the screen.
- **Handling**: This is the standard W3C PWA lifecycle pattern for custom in-app prompts. The event object is captured in `deferredInstallPrompt` in `src/services/pwa.js`, and `deferredInstallPrompt.prompt()` is cleanly triggered when the user clicks the custom **"Install GharlyApp"** button in `install-prompt.js` or **Settings**.

### Issue #2: Invite Family Member Modal Broken/Transparent Background (Resolved)
- **Observed Behavior**: Opening the "Invite Family Member" modal rendered with a transparent/broken background.
- **Root Cause**: The modal container in `household.js` referenced undefined CSS token `var(--wa-color-surface-card)` and `var(--wa-color-surface-subtle)` instead of standard Web Awesome tokens `var(--wa-color-surface-raised, #ffffff)` and `var(--wa-color-surface-lowered, #f8fafc)`.
- **Resolution**: Updated `src/screens/household.js` with solid theme-reactive surface tokens, backdrop blur (`rgba(15, 23, 42, 0.65)`), safe-area padding, and crisp header layout.

---

## 4. Feature Specification: Financial Reports, Analytics & Budget Planning

### 4.1 Overview & Vision
A dedicated **Reports & Insights** screen (`#/reports` / `#/analytics`) empowering households to understand their historical spending habits across custom intervals, leading directly into **Smart Budget Planning & Recommendations**.

### 4.2 Key Capabilities

#### 1. Multi-Period Financial Reports & Filtering
- **Time Ranges**: 
  - `This Week` / `Last Week`
  - `This Month` / `Last Month`
  - `Quarterly (3 Months)` / `This Year (YTD)`
  - `Custom Date Range Picker` (From Date &rarr; To Date)
- **Categorical Breakdown**:
  - Breakdown by expense category (Groceries, Utilities, Rent/Housing, Transport/Fuel, Medical, Education, Entertainment, Other).
  - Visual share percentage and total amount spent per category.
- **Cashflow & Savings Rate Analysis**:
  - Net Income vs Net Expense comparison.
  - Net savings velocity and month-over-month percentage changes (+/- %).
- **Member Attribution Analysis**:
  - Breakdown of expenses logged by individual household members.
- **Exporting & Sharing**:
  - Downloadable monthly PDF Statement.
  - CSV / Excel export for detailed accounting.
  - 1-click formatted WhatsApp text summary for family discussions.

#### 4.3 Phase 2: Budget Planning & Intelligent Recommendations
- **Category-Wise Monthly Budgets**:
  - Set custom target ceilings (e.g. *Groceries: PKR 45,000 / month*, *Fuel: PKR 18,000 / month*).
  - Live budget meters: Safe (Green <70%), Warning (Amber 70-90%), Exceeded (Red >100%).
- **Smart Predictive Recommendations**:
  - Trend forecasting based on historical averages (*"You are on track to exceed your Utility budget by PKR 4,500 this month"*).
  - Seasonal adjustments (*"Summer electricity bills typically increase by 40% — suggested budget adjustment: +PKR 7,500"*).
  - Savings suggestions based on recurring hisab logs.
