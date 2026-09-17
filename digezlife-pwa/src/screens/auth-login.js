import { navigate } from '../state/router.js';
import { login, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { readLocal } from '../services/storage.js';

export const loginScreen = {
  meta: { topbar: null, nav: null },
  render() {
    const rememberedUser = readLocal('auth.last_user', null) || readLocal('auth.user', null);
    const displayName = rememberedUser?.name ? rememberedUser.name.split(' ')[0] : '';
    const heading = displayName ? `Welcome back, ${displayName}` : 'Welcome back';
    const subtitle = displayName
      ? 'Sign in to manage your household groceries, hisab, and reminders.'
      : 'Sign in to manage groceries, hisab, and household reminders.';
    const defaultEmail = rememberedUser?.email || '';

    return `
      <div class="screen auth-screen">
        <div class="auth-screen__header">
          <div class="auth-screen__mark"><span class="app-brand-mark">G</span></div>
          <p class="auth-screen__eyebrow">EVERYDAY HOUSEHOLD OS</p>
          <h1>${heading}</h1>
          <p class="text-quiet">${subtitle}</p>
        </div>

        <form class="stack" data-login-form>
          <div id="auth-error-box" class="auth-error-alert" style="display:none;"></div>

          <wa-input type="email" label="Email Address" name="email" value="${defaultEmail}" placeholder="name@domain.com" required></wa-input>
          <wa-input type="password" label="Password" name="password" placeholder="Enter password" required password-toggle></wa-input>


          <wa-button type="submit" variant="brand" size="large" data-submit style="width:100%; margin-top:0.5rem;">
            Sign In
          </wa-button>
        </form>

        <div class="auth-demo-banner card" style="margin-top:1.25rem;">
          <p class="text-quiet" style="font-size:0.85rem; margin:0 0 0.5rem 0;">
            <strong>Fast Evaluation:</strong> Click below to sign into the pre-seeded demo household.
          </p>
          <wa-button appearance="outlined" size="medium" style="width:100%;" data-demo-btn>
            1-Click Demo Sign In
          </wa-button>
        </div>

        <p class="auth-screen__footer text-quiet" style="margin-top:1.5rem; text-align:center;">
          Don't have an account? <a href="#/signup" style="font-weight:600;">Create Household</a>
        </p>
      </div>
    `;
  },
  afterRender() {
    const form = document.querySelector('[data-login-form]');
    const submitBtn = document.querySelector('[data-submit]');
    const demoBtn = document.querySelector('[data-demo-btn]');
    const errorBox = document.getElementById('auth-error-box');

    const showError = (msg) => {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
      }
    };

    const hideError = () => {
      if (errorBox) {
        errorBox.textContent = '';
        errorBox.style.display = 'none';
      }
    };

    const handleLogin = async (email, password) => {
      hideError();
      if (submitBtn) submitBtn.loading = true;
      try {
        const res = await api.login({ email, password });
        if (res?.meta?.token) {
          const user = {
            name: res.data?.attributes?.name || 'Household User',
            email: res.data?.attributes?.email || email,
          };
          let household = res.meta?.household || { id: 'demo-household', name: 'My Household' };
          login(user, res.meta.token, household);

          // Extract invite code from URL hash or query if present
          const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
          const urlParams = new URLSearchParams(hashQuery || window.location.search);
          const inviteCode = urlParams.get('invite') || urlParams.get('code');

          if (inviteCode) {
            try {
              const joinRes = await api.joinHousehold(inviteCode);
              if (joinRes?.data?.household) {
                household = joinRes.data.household;
                login(user, res.meta.token, household);
                api.setHousehold(household.id);
                pushToast({ message: `Successfully joined ${household.name}!`, variant: 'success' });
              }
            } catch (inviteErr) {
              console.warn('Auto-join on login failed:', inviteErr);
              pushToast({ message: `Logged in, but invite could not be linked: ${inviteErr.message}`, variant: 'warning' });
            }
          } else {
            pushToast({ message: `Welcome back, ${user.name}`, variant: 'success' });
          }

          navigate('/home');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        showError(err.message || 'Authentication failed. Please verify your credentials.');
      } finally {
        if (submitBtn) submitBtn.loading = false;
      }
    };

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('[name="email"]')?.value?.trim();
      const password = form.querySelector('[name="password"]')?.value;
      if (!email || !password) return;
      handleLogin(email, password);
    });

    demoBtn?.addEventListener('click', () => {
      handleLogin('demo@gharlyapp.com', 'password123');
    });
  },
};
