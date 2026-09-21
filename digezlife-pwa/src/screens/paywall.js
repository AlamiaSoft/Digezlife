import { BRAND } from '../config/brand.js';
import { icon } from '../components/icon.js';
import { pushToast, authStore } from '../state/store.js';
import { householdStore } from '../state/household-store.js';
import { api } from '../services/api.js';
import { householdSync } from '../services/household-sync.js';
import { formatDate } from '../utils/format.js';

export const paywallScreen = {
  meta: { topbar: { title: 'Plans & Activation', back: true }, nav: 'home' },

  render() {
    const storeState = householdStore.get();
    const authState = authStore.get();
    const household = storeState.household || authState.household || {};
    const currentPlan = (household.plan || 'free').toLowerCase();
    const subEndsAt = household.subscription_ends_at;

    let planBadge = 'Free Household';
    let planBadgeClass = 'badge-gray';
    if (currentPlan === 'plus') {
      planBadge = 'Plus Family Active';
      planBadgeClass = 'badge-emerald';
    } else if (currentPlan === 'vip') {
      planBadge = 'VIP Household Active';
      planBadgeClass = 'badge-purple';
    }

    const expiryText = subEndsAt
      ? `Valid until ${formatDate(subEndsAt, { full: true })}`
      : currentPlan === 'free'
      ? 'Free Tier (No Expiry)'
      : 'Active';

    return `
      <div class="screen paywall-screen" style="max-width: 620px; margin: 0 auto; padding-bottom: 2.5rem;">
        <div style="text-align:center; padding: 0.75rem 0 1.25rem;">
          <span class="wa-tag badge-purple" style="margin-bottom:0.5rem; font-weight:700;">PAKPAY LOCAL PLANS</span>
          <h2 style="margin: 0.25rem 0 0.4rem; font-size: 1.45rem;">Upgrade Your Household OS</h2>
          <p class="text-quiet" style="font-size:0.88rem; max-width:340px; margin:0 auto;">
            Unlock unlimited family sharing, multi-wallet hisab, and automated WhatsApp reminders.
          </p>
        </div>

        <!-- Current Plan Status Banner -->
        <div class="card" id="current-plan-card" style="padding: 1.15rem; margin-bottom: 1.25rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.05)); border: 1px solid rgba(16, 185, 129, 0.25);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span class="wa-tag ${planBadgeClass}" style="font-weight: 700;" id="active-plan-badge">${planBadge}</span>
              </div>
              <h3 style="margin: 0; font-size: 1.05rem;" id="household-name-display">${household.name || 'My Household'}</h3>
              <p class="text-quiet" style="font-size: 0.78rem; margin: 0.2rem 0 0 0;" id="plan-expiry-display">${expiryText}</p>
            </div>
            <div style="text-align: right;">
              <span class="text-quiet" style="font-size: 0.72rem; display: block;">Household ID</span>
              <code style="font-size: 0.8rem; font-weight: 700; background: var(--wa-color-surface-muted, #f1f5f9); padding: 2px 6px; border-radius: 4px;">${household.id || 'GH-DEFAULT'}</code>
            </div>
          </div>
        </div>

        <!-- Voucher / Promo Code Card -->
        <div class="card" style="padding: 1.15rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--wa-color-brand-fill-quiet); color: var(--wa-color-brand-on-quiet); display: flex; align-items: center; justify-content: center;">
              ${icon('ticket')}
            </div>
            <div>
              <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700;">Redeem Voucher / Promo Code</h4>
              <p class="text-quiet" style="margin: 0; font-size: 0.76rem;">Have a community launch code? (e.g. LAUNCH2026, EARLYBIRD)</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <wa-input id="input-promo-code" placeholder="Enter promo code" style="flex: 1; font-family: monospace; font-weight: 700; text-transform: uppercase;"></wa-input>
            <wa-button id="btn-redeem-promo" variant="brand">Redeem</wa-button>
          </div>
        </div>

        <!-- Plans Stack -->
        <div class="stack" style="gap: 1.25rem;">
          <!-- Plan 1: Free Household -->
          <div class="card" style="padding: 1.25rem; ${currentPlan === 'free' ? 'border: 1.5px solid var(--wa-color-border-normal);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="margin: 0; font-size: 1.1rem;">Free Household</h3>
                <p class="text-quiet" style="font-size: 0.8rem; margin: 0.2rem 0 0 0;">Basic essentials for small families</p>
              </div>
              ${currentPlan === 'free' ? '<span class="wa-tag badge-gray">Current Plan</span>' : ''}
            </div>
            <div style="font-size: 1.35rem; font-weight: 800; margin: 0.75rem 0 0.5rem 0;">PKR 0 <small style="font-size: 0.8rem; font-weight: 400; color: var(--wa-color-text-quiet);">/ forever</small></div>
            <ul style="margin: 0.75rem 0 0 0; padding-left: 1.25rem; font-size: 0.85rem; color: var(--wa-color-text-quiet); line-height: 1.6;">
              <li>1 Shared grocery checklist</li>
              <li>Monthly Hisab income & expense ledger</li>
              <li>5 Active reminder tasks</li>
              <li>Up to 2 family members</li>
            </ul>
          </div>

          <!-- Plan 2: Plus Family -->
          <div class="card" style="padding: 1.25rem; border: 2px solid var(--wa-color-brand-fill-loud); position: relative;">
            <span class="wa-tag badge-emerald" style="position: absolute; top: -12px; right: 16px; font-weight: 700;">MOST POPULAR</span>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; color: var(--wa-color-brand-on-normal);">Plus Family</h3>
                <p class="text-quiet" style="font-size: 0.8rem; margin: 0.2rem 0 0 0;">For full family collaboration</p>
              </div>
              ${currentPlan === 'plus' ? '<span class="wa-tag badge-emerald">Current Plan</span>' : ''}
            </div>
            <div style="font-size: 1.45rem; font-weight: 800; margin: 0.75rem 0 0.5rem 0; color: var(--wa-color-brand-on-normal);">
              PKR 499 <small style="font-size: 0.8rem; font-weight: 400; color: var(--wa-color-text-quiet);">/ month (or PKR 4,999 / year)</small>
            </div>
            <ul style="margin: 0.75rem 0 1rem 0; padding-left: 1.25rem; font-size: 0.85rem; color: var(--wa-color-text-quiet); line-height: 1.6;">
              <li>Unlimited grocery lists & instant WhatsApp export</li>
              <li>Multi-wallet Hisab (Cash, Bank, JazzCash) & Udhaar tracking</li>
              <li>Up to 10 family members with granular role permissions</li>
              <li>Automated WhatsApp bill & reminder alerts</li>
              <li>Receipt & expense intelligence</li>
            </ul>
            <wa-button variant="brand" size="l" style="width: 100%;" data-select-plan="plus" data-plan-name="Plus Family" data-plan-price="499">
              ${icon('credit-card')} Pay via JazzCash / EasyPaisa / Bank
            </wa-button>
          </div>

          <!-- Plan 3: VIP Household -->
          <div class="card" style="padding: 1.25rem; ${currentPlan === 'vip' ? 'border: 2px solid var(--wa-color-primary-600);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="margin: 0; font-size: 1.1rem;">VIP Household</h3>
                <p class="text-quiet" style="font-size: 0.8rem; margin: 0.2rem 0 0 0;">Multiple properties & domestic staff</p>
              </div>
              ${currentPlan === 'vip' ? '<span class="wa-tag badge-purple">Current Plan</span>' : ''}
            </div>
            <div style="font-size: 1.4rem; font-weight: 800; margin: 0.75rem 0 0.5rem 0;">
              PKR 1,499 <small style="font-size: 0.8rem; font-weight: 400; color: var(--wa-color-text-quiet);">/ month</small>
            </div>
            <ul style="margin: 0.75rem 0 1rem 0; padding-left: 1.25rem; font-size: 0.85rem; color: var(--wa-color-text-quiet); line-height: 1.6;">
              <li>Everything in Plus Family</li>
              <li>Multiple household & rental property profiles</li>
              <li>Domestic staff salary & advance khata</li>
              <li>Automated utility bill fetcher</li>
              <li>VIP WhatsApp priority concierge & support</li>
            </ul>
            <wa-button appearance="outlined" size="l" style="width: 100%;" data-select-plan="vip" data-plan-name="VIP Household" data-plan-price="1499">
              ${icon('star')} Upgrade to VIP
            </wa-button>
          </div>
        </div>

        <!-- Local Payment Instructions Drawer -->
        <wa-drawer id="payment-drawer" label="Local Payment Instructions" placement="bottom" style="--size: 540px;">
          <div class="stack" style="gap: 1rem; padding: 0.5rem 0;">
            <div style="background: var(--wa-color-surface-muted, #f8fafc); padding: 0.85rem 1rem; border-radius: 8px; border-left: 4px solid var(--wa-color-brand-fill-loud);">
              <div style="font-weight: 800; font-size: 0.95rem;" id="drawer-plan-title">Plus Family Plan — PKR 499</div>
              <div class="text-quiet" style="font-size: 0.78rem;">Household Reference: <strong id="drawer-household-ref">${household.name || 'My Household'} (${household.id || 'GH-DEFAULT'})</strong></div>
            </div>

            <p style="font-size: 0.84rem; margin: 0; color: var(--wa-color-text-quiet);">
              Transfer the exact plan amount to any of our verified accounts below, then send a screenshot of the receipt via WhatsApp for instant activation.
            </p>

            <!-- Bank Accounts -->
            <div class="stack" style="gap: 0.75rem;">
              <!-- Meezan Bank -->
              <div style="border: 1px solid var(--wa-color-border-normal); border-radius: 8px; padding: 0.75rem 0.9rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <strong style="font-size: 0.88rem;">Meezan Bank Ltd</strong>
                  <wa-tag size="s" variant="neutral">Direct Transfer / Raast</wa-tag>
                </div>
                <div style="font-size: 0.8rem; line-height: 1.5;">
                  <div>Title: <strong>Alamia Technologies</strong></div>
                  <div>Account: <strong>01010102938475</strong></div>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span>IBAN: <code style="font-size: 0.75rem;">PK89MEZN0001010102938475</code></span>
                    <button type="button" class="wa-btn-copy" data-copy="PK89MEZN0001010102938475" style="border:none; background:none; cursor:pointer; color:var(--wa-color-brand-on-normal); padding:2px;">${icon('copy')}</button>
                  </div>
                </div>
              </div>

              <!-- JazzCash & EasyPaisa -->
              <div style="border: 1px solid var(--wa-color-border-normal); border-radius: 8px; padding: 0.75rem 0.9rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <strong style="font-size: 0.88rem;">JazzCash / EasyPaisa</strong>
                  <wa-tag size="s" variant="brand">Mobile Wallet</wa-tag>
                </div>
                <div style="font-size: 0.8rem; line-height: 1.5;">
                  <div>Title: <strong>Muhammad Ali (Alamia)</strong></div>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span>Number: <strong>0300-1234567</strong></span>
                    <button type="button" class="wa-btn-copy" data-copy="03001234567" style="border:none; background:none; cursor:pointer; color:var(--wa-color-brand-on-normal); padding:2px;">${icon('copy')}</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- WhatsApp Action CTA -->
            <div style="margin-top: 0.5rem;">
              <wa-button variant="brand" size="l" style="width: 100%;" id="btn-submit-whatsapp-proof">
                ${icon('share-nodes')} Send Receipt on WhatsApp
              </wa-button>
              <p class="text-quiet" style="text-align: center; font-size: 0.75rem; margin: 0.4rem 0 0;">
                Accounts are activated within 5-15 minutes after receipt verification.
              </p>
            </div>
          </div>
        </wa-drawer>
      </div>
    `;
  },

  afterRender() {
    let selectedPlan = 'plus';
    let selectedPlanName = 'Plus Family';
    let selectedPlanPrice = '499';

    const drawer = document.getElementById('payment-drawer');
    const drawerTitle = document.getElementById('drawer-plan-title');
    const waProofBtn = document.getElementById('btn-submit-whatsapp-proof');

    const openDrawer = () => {
      if (drawer) {
        drawer.open = true;
      }
    };

    // Plan selection buttons
    document.querySelectorAll('[data-select-plan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedPlan = btn.dataset.selectPlan;
        selectedPlanName = btn.dataset.planName;
        selectedPlanPrice = btn.dataset.planPrice;

        if (drawerTitle) {
          drawerTitle.textContent = `${selectedPlanName} Plan — PKR ${selectedPlanPrice}`;
        }
        openDrawer();
      });
    });

    // Copy to clipboard buttons
    document.querySelectorAll('.wa-btn-copy').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.copy;
        if (text) {
          navigator.clipboard.writeText(text);
          pushToast({ message: `Copied to clipboard: ${text}`, variant: 'neutral' });
        }
      });
    });

    // WhatsApp proof submission
    waProofBtn?.addEventListener('click', () => {
      const store = householdStore.get();
      const household = store.household || {};
      const householdName = household.name || 'My Household';
      const householdId = household.id || 'GH-DEFAULT';

      const message = `Assalam-o-Alaikum! I have paid PKR ${selectedPlanPrice} for ${selectedPlanName} plan for household "${householdName}" (ID: ${householdId}). Please verify and activate my subscription.`;
      const waUrl = `https://wa.me/923001234567?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });

    // Promo code redemption
    const promoInput = document.getElementById('input-promo-code');
    const redeemBtn = document.getElementById('btn-redeem-promo');

    redeemBtn?.addEventListener('click', async () => {
      const code = (promoInput?.value || '').trim();
      if (!code) {
        pushToast({ message: 'Please enter a promo or voucher code.', variant: 'warning' });
        return;
      }

      try {
        redeemBtn.loading = true;
        const res = await api.redeemPromoCode(code);
        pushToast({
          message: res.message || 'Voucher redeemed successfully! Plan activated.',
          variant: 'success',
        });

        // Re-sync household state immediately
        await householdSync.sync({ force: true });

        // Re-render to reflect new plan status
        const app = document.getElementById('app');
        if (app) {
          app.innerHTML = paywallScreen.render();
          paywallScreen.afterRender();
        }
      } catch (err) {
        console.error('Promo code redemption failed:', err);
        pushToast({
          message: err.message || 'Invalid or expired promo code.',
          variant: 'danger',
        });
      } finally {
        if (redeemBtn) redeemBtn.loading = false;
      }
    });
  },
};
