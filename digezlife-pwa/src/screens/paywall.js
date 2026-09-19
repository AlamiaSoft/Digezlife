import { icon } from '../components/icon.js';
import { pushToast } from '../state/store.js';

export const paywallScreen = {
  meta: { topbar: { title: 'Household Plans', back: true }, nav: 'home' },


  render() {
    return `
      <div class="screen paywall-screen">
        <div style="text-align:center; padding:1rem 0 1.5rem;">
          <span class="wa-tag badge-purple" style="margin-bottom:0.5rem;">PAKPAY LOCAL PLANS</span>
          <h2>Upgrade Your Household OS</h2>
          <p class="text-quiet" style="font-size:0.9rem; max-width:320px; margin:0.4rem auto 0;">Unlock unlimited family sharing, automated WhatsApp reminders, and receipt intelligence.</p>
        </div>

        <div class="stack" style="gap:1rem;">
          <!-- Plan 1: Free Household -->
          <div class="card" style="padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="margin:0; font-size:1.1rem;">Free Household</h3>
                <p class="text-quiet" style="font-size:0.8rem; margin:0.2rem 0 0 0;">Basic essentials for small families</p>
              </div>
              <span class="wa-tag">Current Plan</span>
            </div>
            <div style="font-size:1.4rem; font-weight:800; margin:0.75rem 0 0.5rem 0;">PKR 0 <small style="font-size:0.8rem; font-weight:400; color:var(--wa-color-text-quiet);">/ forever</small></div>
            <ul style="margin:0.75rem 0 0 0; padding-left:1.25rem; font-size:0.85rem; color:var(--wa-color-text-quiet); line-height:1.6;">
              <li>1 Shared grocery checklist</li>
              <li>Monthly Hisab income & expense ledger</li>
              <li>5 Active reminder tasks</li>
            </ul>
          </div>

          <!-- Plan 2: Plus Family -->
          <div class="card" style="padding:1.25rem; border:2px solid var(--wa-color-brand-fill-loud); position:relative;">
            <span class="wa-tag badge-emerald" style="position:absolute; top:-12px; right:16px;">MOST POPULAR</span>
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="margin:0; font-size:1.15rem; color:var(--wa-color-brand-on-normal);">Plus Family</h3>
                <p class="text-quiet" style="font-size:0.8rem; margin:0.2rem 0 0 0;">For full family collaboration</p>
              </div>
            </div>
            <div style="font-size:1.5rem; font-weight:800; margin:0.75rem 0 0.5rem 0; color:var(--wa-color-brand-on-normal);">PKR 499 <small style="font-size:0.8rem; font-weight:400; color:var(--wa-color-text-quiet);">/ month</small></div>
            <ul style="margin:0.75rem 0 1rem 0; padding-left:1.25rem; font-size:0.85rem; color:var(--wa-color-text-quiet); line-height:1.6;">
              <li>Unlimited grocery lists & WhatsApp export</li>
              <li>Multi-member shared Hisab with Udhaar tracking</li>
              <li>Unlimited scheduled alerts & bill tracking</li>
              <li>Automated WhatsApp payment reminders</li>
            </ul>
            <wa-button variant="brand" size="l" style="width:100%;" data-upgrade="plus">
              Upgrade to Plus (JazzCash / EasyPaisa)
            </wa-button>
          </div>

          <!-- Plan 3: VIP Household -->
          <div class="card" style="padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="margin:0; font-size:1.1rem;">VIP Household</h3>
                <p class="text-quiet" style="font-size:0.8rem; margin:0.2rem 0 0 0;">Multiple properties & domestic staff</p>
              </div>
            </div>
            <div style="font-size:1.4rem; font-weight:800; margin:0.75rem 0 0.5rem 0;">PKR 1,499 <small style="font-size:0.8rem; font-weight:400; color:var(--wa-color-text-quiet);">/ month</small></div>
            <ul style="margin:0.75rem 0 1rem 0; padding-left:1.25rem; font-size:0.85rem; color:var(--wa-color-text-quiet); line-height:1.6;">
              <li>Multiple household & property profiles</li>
              <li>Domestic staff salary & advance khata</li>
              <li>Automated utility bill fetcher</li>
              <li>VIP WhatsApp priority support</li>
            </ul>
            <wa-button appearance="outlined" size="l" style="width:100%;" data-upgrade="vip">
              Upgrade to VIP
            </wa-button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    document.querySelectorAll('[data-upgrade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const plan = btn.dataset.upgrade;
        pushToast({ message: `PakPay checkout for ${plan.toUpperCase()} tier opening...`, variant: 'brand' });
      });
    });
  },
};
