import { BRAND } from '../config/brand.js';

export const legalAcceptableUseScreen = {
  meta: { topbar: { title: 'Acceptable Use Policy', back: true } },

  render() {
    return `
      <div class="screen legal-screen" style="padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="margin:0; font-size:1.4rem; font-weight:800;">Acceptable Use Policy</h2>
          <wa-badge variant="neutral">v1.0 &bull; Sept 2026</wa-badge>
        </div>

        <div class="card" style="padding:1.25rem; line-height:1.6; font-size:0.88rem;">
          <h3 style="margin-top:0;">Prohibited Activities</h3>
          <p>When using ${BRAND.name}, you agree not to:</p>
          <ul style="padding-left:1.2rem;">
            <li>Create fake or duplicate accounts for artificial referral rewards.</li>
            <li>Attempt to bypass API authorization, rate limits, or household tenancy controls.</li>
            <li>Use automated bots or scrapers on ${BRAND.name} endpoints.</li>
            <li>Upload malicious content or engage in unauthorized access to other households.</li>
          </ul>
          <p>Violations will result in account suspension and revocation of accrued rewards.</p>
        </div>
      </div>
    `;
  },
};
