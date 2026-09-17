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
