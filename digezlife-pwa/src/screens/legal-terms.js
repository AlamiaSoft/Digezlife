import { BRAND } from '../config/brand.js';

export const legalTermsScreen = {
  meta: { topbar: { title: 'Terms of Service', back: true } },

  render() {
    return `
      <div class="screen legal-screen" style="padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="margin:0; font-size:1.4rem; font-weight:800;">Terms of Service</h2>
          <wa-badge variant="neutral">v1.0 &bull; Sept 2026</wa-badge>
        </div>

        <div class="card" style="padding:1.25rem; line-height:1.6; font-size:0.88rem;">
          <h3 style="margin-top:0;">1. Acceptance of Terms</h3>
          <p>By creating an account or using ${BRAND.name}, you agree to these Terms of Service. Users retain full ownership of all data entered into their household ledgers.</p>

          <h3>2. Household Responsibility</h3>
          <p>The household admin is responsible for managing household member access, roles, and permissions within their workspace.</p>

          <h3>3. Referral Program Terms</h3>
          <p>Rewards earned through the ${BRAND.name} Giveback and Referral program are promotional credits provided by Gharly. Self-referrals and automated bot accounts are strictly prohibited and subject to reward forfeiture.</p>

          <h3>4. Early Access / Beta Clause</h3>
          <p>${BRAND.name} is currently operating in early access mode. Features may be updated or improved based on user feedback.</p>
        </div>
      </div>
    `;
  },
};
