import { icon } from '../components/icon.js';
import { BRAND } from '../config/brand.js';

export const legalPrivacyScreen = {
  meta: { topbar: { title: 'Privacy Policy', back: true } },

  render() {
    return `
      <div class="screen legal-screen" style="padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="margin:0; font-size:1.4rem; font-weight:800;">Privacy Policy</h2>
          <wa-badge variant="neutral">v1.0 &bull; Sept 2026</wa-badge>
        </div>

        <div class="card" style="padding:1.25rem; line-height:1.6; font-size:0.88rem;">
          <h3 style="margin-top:0;">1. Data We Collect</h3>
          <p>We collect household operational data required to provide ${BRAND.name} services, including grocery items, expenses, reminders, and profile contact details (email, mobile number).</p>

          <h3>2. How We Use Data</h3>
          <p>Your household data is used exclusively to sync your personal grocery, hisab, and reminder ledgers in real-time. We do not sell your personal or financial data to third-party advertisers.</p>

          <h3>3. Data Isolation & Security</h3>
          <p>All household data is isolated per household tenant. Connections use HTTPS encryption in transit, and database records use strict multi-tenant authorization scoping.</p>

          <h3>4. Retention & Deletion</h3>
          <p>You can export or request full deletion of your household data at any time by contacting support at <strong>${BRAND.supportEmail}</strong>.</p>
        </div>
      </div>
    `;
  },
};
