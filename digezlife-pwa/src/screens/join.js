import { navigate } from '../state/router.js';
import { authStore, login, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { readLocal } from '../services/storage.js';

export const joinScreen = {
  meta: { topbar: { title: 'Join Household', back: false }, nav: null },

  render() {
    const { user, authenticated } = authStore.get();
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const params = new URLSearchParams(hashQuery);
    const code = params.get('code') || '';

    return `
      <div class="screen join-screen auth-screen">
        <div class="auth-screen__header">
          <div class="large-avatar-pill" style="width:56px; height:56px; font-size:1.4rem; margin:0 auto 0.75rem auto; background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
            🏡
          </div>
          <span class="auth-screen__eyebrow">FAMILY INVITATION</span>
          <h1>Join Household Space</h1>
          <p class="text-quiet" style="font-size:0.88rem; line-height:1.45; margin-top:0.25rem;">
            You have been invited to collaborate on shared groceries, hisab, and family reminders.
          </p>
        </div>

        <div class="card join-card">
          <div class="join-code-badge-row">
            <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">INVITATION CODE</span>
            <span class="wa-tag badge-emerald" style="font-size:0.7rem; font-weight:700;">VALID CODE</span>
          </div>
          <wa-input id="input-join-code" value="${code}" placeholder="Enter invitation code" size="m" style="width:100%; font-family:monospace; font-weight:700;"></wa-input>

          ${
            authenticated
              ? `
            <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--wa-color-surface-border);">
              <span class="text-quiet" style="font-size:0.78rem;">Joining as:</span>
              <div style="font-weight:700; font-size:0.92rem; margin-top:0.15rem; word-break:break-word;">
                ${user?.name || 'Logged in user'} <span class="text-quiet">(${user?.email || ''})</span>
              </div>
            </div>
            <div class="join-btn-stack">
              <wa-button variant="brand" size="l" class="join-btn" id="btn-accept-join">
                ${icon('check')} Accept &amp; Join Household
              </wa-button>
            </div>
          `
              : `
            <div class="join-btn-stack">
              <wa-button variant="brand" size="l" class="join-btn" id="btn-join-signup">
                ${icon('user-plus')} Sign Up &amp; Join
              </wa-button>
              <wa-button appearance="outlined" size="l" class="join-btn" id="btn-join-login">
                ${icon('right-to-bracket')} Log In &amp; Join
              </wa-button>
            </div>
          `
          }
        </div>

        <div style="text-align:center; margin-top:1.5rem;">
          <a href="#/home" style="font-size:0.85rem; color:var(--wa-color-text-quiet); text-decoration:none;">
            &larr; Back to Home
          </a>
        </div>
      </div>
    `;
  },

  afterRender() {
    const { authenticated } = authStore.get();

    const getCode = () => {
      const input = document.getElementById('input-join-code');
      return input?.value?.trim() || '';
    };

    if (authenticated) {
      document.getElementById('btn-accept-join')?.addEventListener('click', async () => {
        const code = getCode();
        if (!code) {
          pushToast({ message: 'Please enter a valid invitation code', variant: 'warning' });
          return;
        }

        try {
          const res = await api.joinHousehold(code);
          const household = res?.data?.household;
          if (household) {
            const { user } = authStore.get();
            const token = readLocal('auth.token', null);
            login(user, token, household);
            api.setHousehold(household.id);
          }
          pushToast({
            message: `Welcome! Successfully joined ${household?.name || 'household'}`,
            variant: 'success',
            duration: 5000,
          });
          navigate('/home');
        } catch (err) {
          pushToast({
            message: err.message || 'Could not join household. Please check the code and try again.',
            variant: 'danger',
          });
        }
      });
    } else {
      document.getElementById('btn-join-signup')?.addEventListener('click', () => {
        const code = getCode();
        navigate(`/signup?invite=${encodeURIComponent(code)}`);
      });

      document.getElementById('btn-join-login')?.addEventListener('click', () => {
        const code = getCode();
        navigate(`/login?invite=${encodeURIComponent(code)}`);
      });
    }
  },
};
