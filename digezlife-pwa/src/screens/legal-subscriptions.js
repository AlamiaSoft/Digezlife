import { BRAND } from '../config/brand.js';

export const legalSubscriptionsScreen = {
  meta: { topbar: { title: 'Subscriptions & Refunds', back: true } },

  render() {
    return `
      <div class="screen legal-screen" style="padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="margin:0; font-size:1.4rem; font-weight:800;">Subscription Policy</h2>
          <wa-badge variant="neutral">v1.0 &bull; Sept 2026</wa-badge>
        </div>

        <div class="card" style="padding:1.25rem; line-height:1.6; font-size:0.88rem;">
          <h3 style="margin-top:0;">1. Subscription Plans</h3>
          <p>${BRAND.name} offers free household tier access and optional premium plans (Family Plus) for expanded seats, reporting, and giveback rewards.</p>

          <h3>2. Cancellation & Grace Period</h3>
          <p>You can cancel your subscription at any time. Upon expiration, your account enters a 7-day grace period before transitioning to the free tier. Your historical data remains intact.</p>

          <h3>3. Refunds</h3>
          <p>Subscription payments are non-refundable unless required by applicable law or in cases of duplicate billing errors. Contact <strong>${BRAND.supportEmail}</strong> for billing inquiries.</p>
        </div>
      </div>
    `;
  },
};
