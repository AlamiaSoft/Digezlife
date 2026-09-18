import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export const rewardsScreen = {
  meta: { topbar: { title: 'Gharly Rewards', back: true }, nav: 'profile' },

  render() {
    return `
      <div class="screen rewards-screen">
        <!-- Summary Cards -->
        <section class="card" id="rewards-summary-card" style="padding:1.25rem; background:linear-gradient(135deg, var(--wa-color-brand-fill-quiet, #f0fdf4), var(--wa-color-surface-card)); border:1px solid var(--wa-color-brand-fill, #16a34a);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
            <div>
              <span class="text-quiet" style="font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Available Rewards</span>
              <h2 id="summary-total-available" style="margin:0.25rem 0 0; font-size:1.8rem; font-weight:800; color:var(--wa-color-brand-fill);">PKR 0.00</h2>
            </div>
            <wa-badge variant="success" style="font-weight:700;">Active</wa-badge>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.5rem; text-align:center; padding-top:0.75rem; border-top:1px solid var(--wa-color-surface-border);">
            <div>
              <div class="text-quiet" style="font-size:0.72rem; font-weight:700; text-transform:uppercase;">Cashback</div>
              <div id="summary-cashback" style="font-weight:800; font-size:0.95rem; margin-top:0.2rem;">PKR 0.00</div>
            </div>
            <div>
              <div class="text-quiet" style="font-size:0.72rem; font-weight:700; text-transform:uppercase;">Credits</div>
              <div id="summary-credits" style="font-weight:800; font-size:0.95rem; margin-top:0.2rem;">PKR 0.00</div>
            </div>
            <div>
              <div class="text-quiet" style="font-size:0.72rem; font-weight:700; text-transform:uppercase;">Points</div>
              <div id="summary-points" style="font-weight:800; font-size:0.95rem; margin-top:0.2rem;">0 pts</div>
            </div>
          </div>
        </section>

        <!-- Giveback Transparency Badge -->
        <div class="card" style="margin-top:1rem; padding:0.85rem 1rem; background:var(--wa-color-surface-subtle); display:flex; align-items:center; gap:0.75rem;">
          <div style="color:var(--wa-color-brand-fill); font-size:1.2rem; display:flex;">${icon('gift')}</div>
          <div style="flex:1;">
            <div style="font-weight:700; font-size:0.82rem;">Gharly Giveback Pool</div>
            <div class="text-quiet" id="giveback-transparency-text" style="font-size:0.76rem;">Gharly allocates 20% of eligible revenue back to household rewards each month.</div>
          </div>
        </div>

        <!-- Referral Link Section -->
        <div class="card" style="margin-top:1rem; padding:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span style="font-weight:700; font-size:0.88rem;">Invite & Earn</span>
            <span class="text-quiet" id="referral-count-label" style="font-size:0.78rem;">0 Qualified Referrals</span>
          </div>

          <div style="display:flex; gap:0.5rem;">
            <wa-input id="input-referral-code" readonly value="Loading..." style="flex:1;"></wa-input>
            <wa-button id="btn-copy-ref-code" appearance="outlined" size="medium">${icon('copy')} Copy</wa-button>
          </div>
          <wa-button id="btn-share-whatsapp-ref" variant="brand" style="width:100%; margin-top:0.75rem;">
            ${icon('share-nodes')} Share via WhatsApp
          </wa-button>
        </div>

        <!-- Activity History -->
        <div style="margin-top:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase;">Reward History</span>
          </div>

          <div class="card" id="rewards-history-container" style="padding:0.25rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1.5rem 0;">No reward activity yet.</div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    try {
      // 1. Fetch Summary
      const summaryRes = await api.getRewardsSummary().catch(() => null);
      if (summaryRes?.data) {
        const d = summaryRes.data;
        const totalEl = document.getElementById('summary-total-available');
        const cbEl = document.getElementById('summary-cashback');
        const crEl = document.getElementById('summary-credits');
        const ptEl = document.getElementById('summary-points');
        const gbTextEl = document.getElementById('giveback-transparency-text');

        if (totalEl) totalEl.textContent = d.available_total_formatted || 'PKR 0.00';
        if (cbEl) cbEl.textContent = d.cashback_formatted || 'PKR 0.00';
        if (crEl) crEl.textContent = d.credits_formatted || 'PKR 0.00';
        if (ptEl) ptEl.textContent = `${d.points || 0} pts`;
        if (gbTextEl && d.giveback_percentage) {
          gbTextEl.textContent = `Gharly allocates ${d.giveback_percentage}% of eligible revenue back to household rewards each month.`;
        }
      }

      // 2. Fetch Referral Code
      const refRes = await api.getReferralCode().catch(() => null);
      if (refRes?.data) {
        const inputEl = document.getElementById('input-referral-code');
        const countEl = document.getElementById('referral-count-label');
        if (inputEl) inputEl.value = refRes.data.referral_code || '';
        if (countEl) countEl.textContent = `${refRes.data.qualified_count || 0} Qualified Referrals`;

        const copyBtn = document.getElementById('btn-copy-ref-code');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(refRes.data.referral_code || '');
            pushToast({ title: 'Copied!', message: 'Referral code copied to clipboard', variant: 'success' });
          });
        }

        const shareBtn = document.getElementById('btn-share-whatsapp-ref');
        if (shareBtn) {
          shareBtn.addEventListener('click', () => {
            const text = encodeURIComponent(refRes.data.share_text || 'Join me on GharlyApp!');
            window.open(`https://wa.me/?text=${text}`, '_blank');
          });
        }
      }

      // 3. Fetch History
      const histRes = await api.getRewardsHistory().catch(() => null);
      const histContainer = document.getElementById('rewards-history-container');
      if (histContainer && histRes?.data) {
        const items = Array.isArray(histRes.data) ? histRes.data : (histRes.data?.data || []);
        if (items.length === 0) {
          histContainer.innerHTML = `<div class="text-quiet" style="text-align:center; padding:1.5rem 0; font-size:0.85rem;">No reward activity yet.</div>`;
        } else {
          histContainer.innerHTML = items.map((r) => `
            <div class="list-row" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0; border-bottom:1px solid var(--wa-color-surface-border);">
              <div>
                <div style="font-weight:700; font-size:0.88rem; text-transform:capitalize;">${r.event_type || r.type || 'Reward'}</div>
                <div class="text-quiet" style="font-size:0.76rem;">${r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}</div>
              </div>
              <div style="font-weight:800; font-size:0.9rem; color:${(r.amount_minor || 0) >= 0 ? 'var(--wa-color-brand-fill)' : 'var(--wa-color-red-40)'};">
                ${r.amount_minor ? `PKR ${(r.amount_minor / 100).toFixed(2)}` : `${r.points || 0} pts`}
              </div>
            </div>
          `).join('');
        }
      }
    } catch (e) {
      console.warn('Rewards load error:', e);
    }
  },
};
