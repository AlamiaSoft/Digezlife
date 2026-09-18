/**
 * SSOT Brand Configuration
 * All brand strings are read from Vite env vars so they can be changed
 * from .env without touching any screen code.
 */
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
    grocery: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Sauda`,
    hisab: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Hisab`,
    reminders: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Reminders`,
    family: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Family`,
    rewards: `${import.meta.env.VITE_APP_SHORT_NAME || 'Gharly'} Rewards`,
  },
  urls: {
    website: `https://${import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com'}`,
    invite: (token) => `https://${import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com'}/#/join?code=${token}`,
    privacy: `https://${import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com'}/#/privacy`,
    terms: `https://${import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com'}/#/terms`,
  },
});
